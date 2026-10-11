"""Transport-only interface. No automatic failover; one recipient per attempt."""
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Protocol
from datetime import datetime, timezone, timedelta
from uuid import UUID

SIMULATOR_RECIPIENTS = frozenset({'success@simulator.amazonses.com', 'bounce@simulator.amazonses.com', 'complaint@simulator.amazonses.com'})

@dataclass(frozen=True)
class Message:
    to: str
    subject: str
    html: str
    unsubscribe_url: str
    attempt_id: str
    simulator_run: dict | None = None

class DeliveryError(Exception):
    def __init__(self, code, outcome="uncertain"):
        super().__init__(code)
        self.code, self.outcome = code, outcome

class Provider(Protocol):
    name: str
    def send(self, message: Message) -> str: ...

class SESProvider:
    name = "ses"
    def __init__(self, client, source, configuration_set):
        self.client, self.source, self.configuration_set = client, source, configuration_set

    def send(self, message):
        # Mandatory during controlled rollout: no environment fallback to general sending.
        try:
            run = message.simulator_run or {}
            UUID(run['id'])
            expiry = datetime.fromisoformat(run['expires_at'].replace('Z', '+00:00'))
            now = datetime.now(timezone.utc)
            allowed = message.to in SIMULATOR_RECIPIENTS and now < expiry <= now + timedelta(minutes=30)
        except (KeyError, ValueError, TypeError, AttributeError):
            allowed = False
        if not allowed:
            raise DeliveryError('simulator_admission_required', 'blocked')
        raw = MIMEMultipart("alternative")
        raw["From"], raw["To"], raw["Subject"] = self.source, message.to, message.subject
        raw["List-Unsubscribe"] = "<" + message.unsubscribe_url.replace("/unsubscribe?", "/api/email/unsubscribe?") + ">"
        raw["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click"
        raw.attach(MIMEText(message.html, "html", "utf-8"))
        args = dict(Source=self.source, Destinations=[message.to], RawMessage={"Data": raw.as_bytes()},
                    Tags=[{"Name": "rr_attempt", "Value": message.attempt_id}])
        if self.configuration_set:
            args["ConfigurationSetName"] = self.configuration_set
        try:
            response = self.client.send_raw_email(**args)
        except Exception as exc:
            error = (getattr(exc, "response", None) or {}).get("Error", {})
            code = error.get("Code", "transport_unknown")
            # Explicit service rejections only. A timeout/5xx may have accepted the email.
            if code in {"Throttling", "ThrottlingException", "TooManyRequestsException"}:
                raise DeliveryError(code, "retryable") from exc
            if code in {"MessageRejected", "MailFromDomainNotVerifiedException", "AccountSendingPausedException",
                        "ConfigurationSetDoesNotExistException", "AccessDenied", "AccessDeniedException", "InvalidParameterValue"}:
                raise DeliveryError(code, "blocked") from exc
            raise DeliveryError(code, "uncertain") from exc
        message_id = response.get("MessageId")
        if not isinstance(message_id, str) or not message_id.strip():
            raise DeliveryError("missing_provider_message_id")
        return message_id

class FakeProvider:
    """Injected by offline tests only; never selectable through production env vars."""
    name = "fake"
    def __init__(self, error=None):
        self.messages, self.error = [], error
    def send(self, message):
        self.messages.append(message)
        if self.error:
            raise self.error
        return "fake-" + message.attempt_id

def configured_provider(env, client_factory=None):
    name = env.get("EMAIL_DELIVERY_PROVIDER", "ses")
    if name != "ses":
        raise ValueError("Unapproved delivery provider: " + name)
    if client_factory is None:
        import boto3
        from botocore.config import Config
        # SDK retry after a lost response can duplicate a send. Let the ledger decide.
        client = boto3.client("ses", region_name=env.get("AWS_REGION") or env.get("AWS_DEFAULT_REGION", "us-east-1"),
                              config=Config(retries={"total_max_attempts": 1}, connect_timeout=5, read_timeout=20))
    else:
        client = client_factory()
    return SESProvider(client, env.get("SES_FROM") or "Donte from RR <hello@revenueripple.org>", env.get("SES_CONFIGURATION_SET"))
