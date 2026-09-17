"""Unit tests for GR → SES cycle mapping and lead-source reconstruction."""

import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from email_crm.sequences import (
    SEQUENCES,
    delay_to_next_step,
    get_sequence,
    next_founders_action,
)
from email_crm.map_cycles import enrollment_from_gr_contact, map_lead_magnet
from email_crm.source import (
    display_name_from_gr_name,
    sequence_id_for_source,
    source_from_contact_name,
    source_from_gr_contact,
)
from email_crm.provider import aws_enrollment_status, should_send_getresponse
import os


def test_name_suffixes():
    assert source_from_contact_name("Jane Doe (Membership Mastery)") == "membership-mastery"
    assert source_from_contact_name("Sam (Digital Marketing Domination)") == "digital-marketing-domination"
    assert source_from_contact_name("Pat (Survival Playbook)") == "survival-playbook"
    assert source_from_contact_name("Tripwire Buyer") == "tripwire"
    assert display_name_from_gr_name("Jane Doe (Membership Mastery)") == "Jane Doe"


def test_paid_tags_win_over_name():
    contact = {"email": "a@x.com", "name": "Jane (Membership Mastery)", "tags": [{"name": "tripwire"}]}
    assert source_from_gr_contact(contact) == "tripwire"


def test_sequence_for_source():
    assert sequence_id_for_source("membership-mastery") == "indoctrination"
    assert sequence_id_for_source("dmd-variation-1") == "indoctrination"
    assert sequence_id_for_source("founders_annual") == "founders_annual"
    assert sequence_id_for_source("tripwire") == "indoctrination"


def test_resume_not_day_zero():
    now = datetime(2026, 9, 10, tzinfo=timezone.utc)
    created = "2026-01-01T00:00:00Z"
    # day 20 is after indoctrination day 14; next is lesson 1 at day 28
    mapped = enrollment_from_gr_contact(
        {
            "email": "a@x.com",
            "name": "Ada (Digital Marketing Domination)",
            "dayOfCycle": 20,
            "createdOn": created,
        },
        now=now,
    )
    assert mapped["enrollment"]["sequence_id"] == "dmd_course_26"
    assert mapped["enrollment"]["step_index"] == 0
    assert mapped["enrollment"]["status"] == "active"
    # created + 21 days is still in the past relative to Sep 2026? Jan 1 + 21d = Jan 22, which is < Sep 10
    # so next_send_at should clamp to now (due immediately, do not skip the lesson)
    assert mapped["enrollment"]["next_send_at"] == now


def test_mid_indoctrination():
    now = datetime(2026, 1, 4, tzinfo=timezone.utc)
    mapped = enrollment_from_gr_contact(
        {
            "email": "b@x.com",
            "name": "Bo (Membership Mastery)",
            "dayOfCycle": 2,
            "createdOn": "2026-01-01T00:00:00Z",
        },
        now=now,
    )
    # next after day 2 is day 3 (next-steps)
    assert mapped["enrollment"]["sequence_id"] == "indoctrination"
    assert mapped["enrollment"]["step_index"] == 3


def test_brand_new_contact_maps_to_welcome():
    nxt = map_lead_magnet(-1)  # strictly greater than -1 → day 0
    # dayOfCycle 0 means they already received day 0 if GR fired; mapper uses >
    nxt0 = map_lead_magnet(0)
    assert nxt0["day_offset"] == 1
    assert map_lead_magnet(-1)["day_offset"] == 0


def test_completed_year():
    mapped = enrollment_from_gr_contact(
        {
            "email": "c@x.com",
            "name": "Cy (Digital Marketing Domination)",
            "dayOfCycle": 400,
            "createdOn": "2024-01-01T00:00:00Z",
        }
    )
    assert mapped["enrollment"]["status"] == "completed"


def test_unsubscribed_not_enrolled():
    mapped = enrollment_from_gr_contact(
        {
            "email": "d@x.com",
            "name": "Dee (Membership Mastery)",
            "dayOfCycle": 0,
            "unsubscribed": True,
        }
    )
    assert mapped["suppressed"] is True
    assert mapped["enrollment"] is None


def test_holdout_does_not_double_send(monkeypatch=None):
    os.environ["EMAIL_MODE"] = "holdout"
    os.environ["EMAIL_HOLDOUT_FUNNELS"] = "dmd-variation-1"
    assert should_send_getresponse("dmd-variation-1") is False
    assert aws_enrollment_status("dmd-variation-1") == "active"
    assert should_send_getresponse("membership-variation-1") is True
    assert aws_enrollment_status("membership-variation-1") == "paused"
    os.environ["EMAIL_MODE"] = "getresponse"
    os.environ.pop("EMAIL_HOLDOUT_FUNNELS", None)


def test_founders_delay_split():
    steps = SEQUENCES["founders_annual"]["steps"]
    assert delay_to_next_step(steps, 0) == 300
    assert next_founders_action(300) == "sqs"
    assert delay_to_next_step(steps, 1) == 6900
    assert next_founders_action(6900) == "due_worker"
    assert delay_to_next_step(steps, 6) is None
    assert next_founders_action(None) == "complete"
    # Welcome is SQS-kicked (engine stays step_functions so due-worker does not also send it)
    assert get_sequence("founders_annual")["engine"] == "step_functions"


def test_founders_resume_skips_minute_scale():
    mapped = enrollment_from_gr_contact(
        {
            "email": "founder@example.com",
            "name": "Founder Member",
            "tags": [{"name": "founders_annual"}],
            "dayOfCycle": 3,
            "createdOn": "2026-09-01T00:00:00Z",
        },
        now=datetime(2026, 9, 10, tzinfo=timezone.utc),
    )
    assert mapped["enrollment"]["sequence_id"] == "founders_annual"
    assert mapped["enrollment"]["step_index"] == 4
    assert mapped["enrollment"]["engine"] == "due_worker"


def test_dmd_lesson_templates_exist():
    from email_crm.send import TEMPLATES_DIR, render_email

    steps = SEQUENCES["dmd_course_26"]["steps"]
    assert len(steps) == 26
    assert steps[0]["day_offset"] == 28
    assert steps[1]["day_offset"] == 42
    assert steps[-1]["day_offset"] == 28 + (25 * 14)
    for step in steps:
        path = TEMPLATES_DIR / step["template_key"]
        assert path.exists(), step["template_key"]
        body = path.read_text(encoding="utf-8")
        assert "{{first_name}}" in body
        assert "[First Name]" not in body
        assert "[Your Name]" not in body
    html = render_email(
        template_key="dmd_course/01-lesson.html",
        contact={"name": "Ada Lovelace", "email": "ada@x.com", "unsubscribe_token": "tok"},
        extra={"lesson_title": steps[0]["title"], "lesson_number": "1"},
    )
    assert "Ada" in html
    assert "{{first_name}}" not in html


def test_indoctrination_send_templates():
    from email_crm.send import TEMPLATES_DIR, render_email

    steps = SEQUENCES["indoctrination"]["steps"]
    assert len(steps) == 9
    for step in steps:
        path = TEMPLATES_DIR / step["template_key"]
        assert path.exists(), step["template_key"]
        body = path.read_text(encoding="utf-8")
        assert "{{first_name}}" in body
        assert "[[name]]" not in body
        assert "[[firstname]]" not in body
        assert "gr-custom-field" not in body
    roadmap = (TEMPLATES_DIR / "indoctrination/07-personal-roadmap.html").read_text(encoding="utf-8")
    assert "guns blazing" not in roadmap.lower()
    assert "personal roadmap" in roadmap.lower()
    html = render_email(
        template_key="indoctrination/07-personal-roadmap.html",
        contact={"name": "Ada Lovelace", "email": "ada@x.com", "unsubscribe_token": "tok"},
    )
    assert "Ada" in html
    assert "{{first_name}}" not in html


def test_list_restart_hands_off_to_lesson_one():
    from email_crm.send import TEMPLATES_DIR

    seq = get_sequence("list_restart")
    assert seq["next_sequence"] == "dmd_course_26"
    assert seq["next_delay_days"] == 3
    assert len(seq["steps"]) == 1
    assert seq["steps"][0]["slug"] == "00-reset"
    assert seq["steps"][0]["template_key"] == "list_restart/00-reset.html"
    reset = (TEMPLATES_DIR / "list_restart/00-reset.html").read_text(encoding="utf-8")
    assert "{{first_name}}" in reset
    assert "lesson 1" in reset.lower()
    assert SEQUENCES["dmd_course_26"]["steps"][0]["slug"] == "01-lesson"


def test_shadow_pauses_aws():
    os.environ["EMAIL_MODE"] = "shadow"
    assert should_send_getresponse("dmd-variation-1") is True
    assert aws_enrollment_status("dmd-variation-1") == "paused"
    os.environ["EMAIL_MODE"] = "getresponse"


def test_csv_import_blocked_until_production():
    import importlib.util

    spec = importlib.util.spec_from_file_location(
        "import_csv_restart",
        ROOT / "scripts/email/import_csv_restart.py",
    )
    mod = importlib.util.module_from_spec(spec)
    os.environ.pop("SES_PRODUCTION_CONFIRMED", None)
    spec.loader.exec_module(mod)
    sys.argv = ["import_csv_restart.py", str(ROOT / "tests/fixtures/gr_contacts.json")]
    # The script expects a CSV path; dry-run with missing confirm should still refuse non-dry-run.
    # Use a tiny fake csv via argv after we patch — call main with activate path.
    import tempfile

    with tempfile.NamedTemporaryFile("w", suffix=".csv", delete=False) as fh:
        fh.write("email,name\nseed@example.com,Seed\n")
        csv_path = fh.name
    old_argv = sys.argv
    sys.argv = ["import_csv_restart.py", csv_path]
    try:
        assert mod.main() == 1
    finally:
        sys.argv = old_argv
        os.unlink(csv_path)


def test_wrap_layout_has_physical_address():
    from email_crm.send import wrap_layout

    html = wrap_layout("<p>Hi</p>", "https://revenueripple.org/unsubscribe?token=x", "Revenue Ripple, Attn: Donte Willis")
    assert "Revenue Ripple, Attn: Donte Willis" in html
    assert "unsubscribe" in html.lower()


if __name__ == "__main__":
    test_name_suffixes()
    test_paid_tags_win_over_name()
    test_sequence_for_source()
    test_resume_not_day_zero()
    test_mid_indoctrination()
    test_brand_new_contact_maps_to_welcome()
    test_completed_year()
    test_unsubscribed_not_enrolled()
    test_holdout_does_not_double_send()
    test_shadow_pauses_aws()
    test_founders_delay_split()
    test_founders_resume_skips_minute_scale()
    test_dmd_lesson_templates_exist()
    test_indoctrination_send_templates()
    test_list_restart_hands_off_to_lesson_one()
    test_csv_import_blocked_until_production()
    test_wrap_layout_has_physical_address()
    print("ok")
