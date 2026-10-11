"""HTML email rendering + SES send used by Flask and documented for Lambdas."""

from __future__ import annotations

import os
from pathlib import Path

from email_crm.enroll import first_name
from email_crm.sequences import get_sequence

TEMPLATES_DIR = Path(__file__).resolve().parent / "templates"

PHYSICAL_ADDRESS_DEFAULT = "Revenue Ripple, Attn: Donte Willis"


def is_unverified_recipient_error(exc: BaseException) -> bool:
    """SES sandbox rejects mail to addresses that are not verified identities."""
    resp = getattr(exc, "response", None) or {}
    err = resp.get("Error") or {}
    blob = f"{err.get('Code', '')} {err.get('Message', '')} {exc}".lower()
    return "not verified" in blob or ("sandbox" in blob and "rejected" in blob)


def _read_template(template_key: str) -> str:
    from email_crm.delivery_runtime.runtime import SIMULATOR_TEMPLATE_KEY, SIMULATOR_HTML
    if template_key == SIMULATOR_TEMPLATE_KEY:
        return SIMULATOR_HTML
    path = (TEMPLATES_DIR / template_key).resolve()
    if not path.is_relative_to(TEMPLATES_DIR.resolve()) or not path.is_file():
        raise ValueError("Missing email template")
    content = path.read_text(encoding="utf-8")
    if not content.strip() or "placeholder" in content.lower():
        raise ValueError("Placeholder email template")
    return content


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


def send_ses(**kwargs):
    """Retired direct-send helper: do not bypass the durable budget/suppression gate."""
    raise RuntimeError("Direct sends are disabled. Use send_enrollment_step with enrollment_id.")


def send_enrollment_step(*, enrollment_id: str, step_index: int | None = None) -> dict:
    if (os.getenv("EMAIL_SEND_ENABLED") or "").lower() not in {"1", "true", "yes"}:
        return {"status": "disabled"}
    from email_crm.delivery_runtime.runtime import Database, Delivery
    from email_crm.delivery_runtime.providers import configured_provider
    service = Delivery(Database(os.environ), configured_provider(os.environ), _read_template, os.environ)
    return {"status": service.deliver(enrollment_id, step_index)}
