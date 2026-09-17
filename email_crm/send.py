"""HTML email rendering + SES send used by Flask and documented for Lambdas."""

from __future__ import annotations

import os
from pathlib import Path

from email_crm.enroll import first_name
from email_crm.sequences import get_sequence

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"

PHYSICAL_ADDRESS_DEFAULT = "Revenue Ripple, Attn: Donte Willis"


def _read_template(template_key: str) -> str:
    path = TEMPLATES_DIR / template_key
    if path.exists():
        return path.read_text(encoding="utf-8")
    folder = Path(template_key).parts[0] if template_key else ""
    fallback = TEMPLATES_DIR / folder / "_placeholder.html"
    if fallback.exists():
        return fallback.read_text(encoding="utf-8")
    return (
        "<p>Hi {{first_name}},</p>"
        "<p>This email is a placeholder. Replace <code>{{template_key}}</code> "
        "with the GetResponse HTML after Phase 0 export.</p>"
        "<p>— Donte<br>Revenue Ripple</p>"
    )


def render_email(*, template_key: str, contact: dict, extra=None) -> str:
    html = _read_template(template_key)
    token = contact.get("unsubscribe_token") or ""
    base = (os.getenv("APP_BASE_URL") or "https://revenueripple.org").rstrip("/")
    unsub = f"{base}/unsubscribe?token={token}"
    address = os.getenv("EMAIL_PHYSICAL_ADDRESS") or PHYSICAL_ADDRESS_DEFAULT
    values = {
        "first_name": first_name(contact.get("name")),
        "name": contact.get("name") or "",
        "email": contact.get("email") or "",
        "unsubscribe_url": unsub,
        "physical_address": address,
        "template_key": template_key,
        "app_base_url": base,
    }
    if extra:
        values.update({k: str(v) for k, v in extra.items() if v is not None})
    for key, val in values.items():
        html = html.replace("{{" + key + "}}", str(val))
    return html


def wrap_layout(inner_html: str, unsubscribe_url: str, physical_address: str) -> str:
    return f"""<!DOCTYPE html>
<html><body style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#111;max-width:640px;margin:0 auto;padding:24px;">
{inner_html}
<hr style="border:none;border-top:1px solid #ddd;margin:32px 0 16px;">
<p style="font-size:12px;color:#666;">
You're receiving this because you opted in at revenueripple.org.
<br><a href="{unsubscribe_url}">Unsubscribe</a>
<br>{physical_address}
</p>
</body></html>"""


def send_ses(*, to_email: str, subject: str, html: str, unsubscribe_url: str) -> dict:
    import boto3

    client = boto3.client("ses", region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
    source = os.getenv("SES_FROM") or "Donte Willis <hello@revenueripple.org>"
    config_set = os.getenv("SES_CONFIGURATION_SET")
    extra = {}
    if config_set:
        extra["ConfigurationSetName"] = config_set
    headers = {
        "List-Unsubscribe": f"<{unsubscribe_url}>",
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    }
    # SES v2 supports List-Unsubscribe natively; v1 SendEmail uses raw for custom headers.
    raw = _raw_message(source, to_email, subject, html, headers)
    kwargs = {
        "Source": source,
        "Destinations": [to_email],
        "RawMessage": {"Data": raw},
    }
    if config_set:
        kwargs["ConfigurationSetName"] = config_set
    resp = client.send_raw_email(**kwargs)
    return {"message_id": resp.get("MessageId")}


def _raw_message(source, to_email, subject, html, headers) -> bytes:
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = source
    msg["To"] = to_email
    for key, val in headers.items():
        msg[key] = val
    msg.attach(MIMEText(html, "html", "utf-8"))
    return msg.as_bytes()


def send_enrollment_step(*, contact: dict, sequence_id: str, step_index: int) -> dict:
    seq = get_sequence(sequence_id)
    step = seq["steps"][step_index]
    extra = {}
    if step.get("title"):
        extra["lesson_title"] = step["title"]
        extra["lesson_number"] = str(step_index + 1)
    html = render_email(template_key=step["template_key"], contact=contact, extra=extra)
    token = contact.get("unsubscribe_token") or ""
    base = (os.getenv("APP_BASE_URL") or "https://revenueripple.org").rstrip("/")
    unsub = f"{base}/unsubscribe?token={token}"
    address = os.getenv("EMAIL_PHYSICAL_ADDRESS") or PHYSICAL_ADDRESS_DEFAULT
    if "<html" not in html.lower():
        html = wrap_layout(html, unsub, address)
    return send_ses(to_email=contact["email"], subject=step["subject"], html=html, unsubscribe_url=unsub)
