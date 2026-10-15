"""Durable dispatch protocol shared by scheduled and queue workers.

Postgres owns claims, suppression, budgets and advancement. An ambiguous send is
quarantined, never replayed. See the accompanying SQL migration and rollout guide.
"""
import hashlib
import html as html_lib
import json
import os
import re
import urllib.request
from urllib.parse import quote
from .providers import DeliveryError, Message, configured_provider

class Database:
    def __init__(self, env):
        self.url = env["SUPABASE_URL"].rstrip("/")
        self.key = env["SUPABASE_SERVICE_ROLE_KEY"]
    def request(self, method, path, body=None):
        req = urllib.request.Request(self.url + "/rest/v1/" + path, method=method,
            data=None if body is None else json.dumps(body).encode(),
            headers={"apikey":self.key,"Authorization":"Bearer " + self.key,"Content-Type":"application/json"})
        with urllib.request.urlopen(req, timeout=20) as response:
            data = response.read()
            return json.loads(data) if data else None
    def rpc(self, name, **params):
        return self.request("POST", "rpc/" + name, params)
    def due(self):
        return self.rpc("email_due")

class ContentError(ValueError): pass

SIMULATOR_TEMPLATE_KEY = 'simulator/isolated-delivery-test.html'
SIMULATOR_HTML = "<html><body><h1>Revenue Ripple delivery test</h1><p>This is an operator-authorized technical test sent only to the Amazon SES mailbox simulator. It is not a marketing subscription or evidence of human consent. No offer or purchase is included.</p></body></html>"

def render(template, contact, step, env):
    if not template or not template.strip() or "placeholder" in template.lower():
        raise ContentError("missing_or_placeholder_template")
    if not contact.get("unsubscribe_token") or not contact.get("email") or not step.get("subject"):
        raise ContentError("missing_message_fields")
    address = env.get("EMAIL_PHYSICAL_ADDRESS", "").strip()
    if not address or address == "Revenue Ripple, Attn: Donte Willis":
        raise ContentError("missing_postal_address")
    base = env.get("APP_BASE_URL", "https://www.revenueripple.org").rstrip("/")
    unsub = base + "/unsubscribe?token=" + quote(str(contact["unsubscribe_token"]), safe="")
    name_parts = (contact.get("name") or "").split()
    values = {"first_name": name_parts[0] if name_parts else "there", "name":contact.get("name") or "",
              "email":contact["email"], "unsubscribe_url":unsub,"physical_address":address,"app_base_url":base,
              "lesson_title":step.get("title", ""),"lesson_number":str(step.get("index",0)+1)}
    for key,value in values.items():
        template = template.replace("{{" + key + "}}", html_lib.escape(str(value), quote=True))
    if re.search(r"{{[^}]+}}", template):
        raise ContentError("unresolved_template_variable")
    footer = "<p><a href='" + html_lib.escape(unsub,quote=True) + "'>Unsubscribe</a><br>" + html_lib.escape(address) + "</p>"
    # Always enforce visible footer, including full HTML templates.
    template = re.sub(r"</body>", lambda match: footer + match.group(0), template, flags=re.I) if re.search(r"</body>",template,re.I) else template + footer
    return template, unsub

class Delivery:
    def __init__(self, db, provider, loader, env):
        self.db,self.provider,self.loader,self.env = db,provider,loader,env
    def deliver(self, enrollment_id, step_index=None):
        claim = self.db.rpc("email_claim",p_enrollment=enrollment_id,p_step=step_index)
        if not claim.get("attempt"):
            return claim["status"]
        a,contact = claim["attempt"],claim["contact"]
        if a["provider"] != self.provider.name:
            raise ValueError("Provider does not match durable attempt")
        try:
            step = a["sequence_snapshot"]["steps"][a["step_index"]]
            template = self.loader(step["template_key"])
            pilot = claim.get("pilot")
            if pilot is not None:
                if (hashlib.sha256(template.encode("utf-8")).hexdigest() != pilot.get("template_sha256")
                    or step["subject"] != pilot.get("subject")
                    or step["template_key"] != pilot.get("template_key")):
                    raise ContentError("pilot_content_changed")
            nurture = claim.get("nurture")
            if nurture is not None:
                if (not self.env.get("EMAIL_NURTURE_BUNDLE_ID")
                    or nurture.get("bundle_id") != self.env["EMAIL_NURTURE_BUNDLE_ID"]
                    or nurture.get("bundle_id") != a["sequence_snapshot"].get("_nurture_bundle")
                    or nurture.get("attempt_id") != a["id"]
                    or nurture.get("claim_token") != a["claim_token"]
                    or nurture.get("step_index") != a["step_index"]
                    or hashlib.sha256(template.encode("utf-8")).hexdigest() != nurture.get("template_sha256")
                    or step.get("template_sha256") != nurture.get("template_sha256")
                    or step["subject"] != nurture.get("subject")
                    or step["template_key"] != nurture.get("template_key")):
                    raise ContentError("nurture_content_changed")
            body,unsub = render(template,contact,step,self.env)
        except Exception:
            self.db.rpc("email_fail_attempt",p_attempt=a["id"],p_token=a["claim_token"],p_state="blocked",p_code="content_unavailable")
            return "blocked"
        state = self.db.rpc("email_begin_send",p_attempt=a["id"],p_token=a["claim_token"])
        if state != "sending":
            return state
        try:
            message_id = self.provider.send(Message(contact["email"],step["subject"],body,unsub,a["id"],claim.get("simulator_run"),claim.get("pilot"),claim.get("nurture"),a["claim_token"]))
        except Exception as exc:
            outcome = exc.outcome if isinstance(exc,DeliveryError) else "uncertain"
            self.db.rpc("email_fail_attempt",p_attempt=a["id"],p_token=a["claim_token"],p_state=outcome,
                        p_code=exc.code if isinstance(exc,DeliveryError) else "transport_unknown")
            return outcome
        # A DB failure here leaves 'sending'. Replays never call the provider again;
        # stale dispatches become uncertain and are reconciled from provider evidence.
        return self.db.rpc("email_accept",p_attempt=a["id"],p_message_id=message_id)

def production_delivery():
    import boto3
    db = Database(os.environ)
    bucket = os.environ.get("EMAIL_TEMPLATE_BUCKET")
    def load(key):
        if key == SIMULATOR_TEMPLATE_KEY:
            return SIMULATOR_HTML
        if not bucket or not key or ".." in key.split("/"):
            raise ContentError("missing_template")
        return boto3.client("s3").get_object(Bucket=bucket,Key="email-templates/"+key)["Body"].read().decode("utf-8")
    return Delivery(db,configured_provider(os.environ),load,os.environ)

def process_ses_event(db, event):
    """Called only from the IAM-restricted SNS subscription, not an HTTP webhook."""
    kind = (event.get("eventType") or event.get("notificationType") or "").lower()
    mail = event.get("mail") or {}
    message_id = mail.get("messageId")
    if not message_id:
        raise ValueError("SES message ID required")
    event_id = hashlib.sha256(json.dumps(event,sort_keys=True,separators=(",", ":")).encode()).hexdigest()
    recipients = []
    event_type = kind
    if kind == "bounce":
        bounce = event.get("bounce") or {}
        recipients = [r["emailAddress"] for r in bounce.get("bouncedRecipients",[]) if r.get("emailAddress")]
        event_type = "bounced" if bounce.get("bounceType", "").lower()=="permanent" else "transient_bounce"
    elif kind == "complaint":
        recipients = [r["emailAddress"] for r in (event.get("complaint") or {}).get("complainedRecipients",[]) if r.get("emailAddress")]
        event_type = "complained"
    else:
        recipients = mail.get("destination") or []
    for email in set(recipients):
        db.rpc("email_record_event",p_provider="ses",p_key=event_id,p_email=email,p_type=event_type,p_message_id=message_id)
    # Matching attempt tag is evidence for acceptance, including bounce/complaint:
    # a provider delivery outcome proves it accepted the send earlier.
    tags = mail.get("tags") or {}
    attempt_ids = tags.get("rr_attempt") or []
    if kind in {"send","delivery","bounce","complaint"} and len(attempt_ids)==1:
        db.rpc("email_accept",p_attempt=attempt_ids[0],p_message_id=message_id)
