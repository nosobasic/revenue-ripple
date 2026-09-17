"""SES / enrollment CRM used by Flask, CLI scripts, and (via copies) Lambdas."""

from email_crm.sequences import SEQUENCES, get_sequence, lead_magnet_calendar
from email_crm.source import source_from_contact_name, source_from_tag

__all__ = [
    "SEQUENCES",
    "get_sequence",
    "lead_magnet_calendar",
    "source_from_contact_name",
    "source_from_tag",
]
