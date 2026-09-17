"""Sequence catalogs for lead-magnet drip + paid short flows.

Indoctrination days 0/1/2/3/4/5/7/10/14 (GetResponse Welcome 1–9) then 26
biweekly lessons starting day 28 (14 days after the last indoctrination
email). Founders uses minute/hour offsets. SQS FIFO sends 0/5-minute emails;
longer waits use the due-worker.

Indoctrination, DMD lessons, and the list-restart note live in
email_crm/templates/. Founders copy is in-repo. Tripwire/paid bodies are
shelved while the product is free.

Existing subscribers do not resume a GetResponse dayOfCycle. They get
list_restart (honest reset email) then DMD lesson 1. New opt-ins still
enter indoctrination.
"""

from __future__ import annotations

from copy import deepcopy

INDOCTRINATION_STEPS = [
    {"index": 0, "day_offset": 0, "slug": "00-welcome", "subject": "Welcome - Can You Confirm You're a Human?"},
    {"index": 1, "day_offset": 1, "slug": "01-introduce-myself", "subject": "Forgot to introduce myself"},
    {"index": 2, "day_offset": 2, "slug": "02-third-gift", "subject": "Your third gift"},
    {"index": 3, "day_offset": 3, "slug": "03-next-steps", "subject": "Next steps."},
    {"index": 4, "day_offset": 4, "slug": "04-do-this-instead", "subject": "Don't do everything (do THIS instead)"},
    {"index": 5, "day_offset": 5, "slug": "05-meet-the-family", "subject": "Meet the Revenue Ripple family"},
    {"index": 6, "day_offset": 7, "slug": "06-jakes-launch", "subject": "Jake's first launch FAILED"},
    {"index": 7, "day_offset": 10, "slug": "07-personal-roadmap", "subject": "Your personal roadmap"},
    {"index": 8, "day_offset": 14, "slug": "08-first-90-days", "subject": "Your first 90 days (here's what to expect)"},
]

DMD_LESSON_TITLES = [
    "The Secret to Building a Successful Email Marketing Campaign",
    "The Power of Social Media in Your Internet Marketing Strategy",
    "The Power of Content Marketing in Your Marketing Strategy",
    "Boost Your Website Traffic with Effective SEO Tactics",
    "Mastering PPC Advertising for Effective Conversions",
    "Mastering the Art of Copywriting for Effective Marketing",
    "Creating a Strong Brand Identity Online for Greater Success",
    "Influencer Marketing - Leveraging the Power of Social Media",
    "The Power of Video Marketing - Boosting Your Brand and Engagement",
    "Creating Effective Landing Pages - Boosting Your Conversion Rates",
    "Understanding and Utilizing Google Analytics to Measure Your Online Success",
    "The Importance of Mobile Optimization - Reaching Your Audience Anywhere",
    "Creating Successful Social Media Campaigns - Reaching Your Audience on Social Platforms",
    "Using Chatbots to Enhance Your Customer Engagement and Sales",
    "The Power of User-Generated Content - Building Trust and Loyalty",
    "Best Practices for Building a Successful E-Commerce Business",
    "The Benefits and Challenges of Affiliate Marketing",
    "Nurturing Leads through Effective Email Marketing",
    "The Power of Customer Reviews and How to Use Them to Your Advantage",
    "How to Utilize Retargeting Ads to Bring Back Lost Customers",
    "The Art of Storytelling in Marketing",
    "Effective Branding and Marketing Strategies for Small Businesses",
    "Strategies for Creating Engaging and Shareable Content",
    "How to Optimize Your Website for Search Engines and User Experience",
    "Creating Effective Sales Funnels for Maximum Conversions",
    "Utilizing Data-Driven Insights to Improve Your Marketing Strategy",
]


def _dmd_course_steps():
    steps = []
    for i, title in enumerate(DMD_LESSON_TITLES):
        # Lesson 1 = 14 days after the last indoctrination email (day 14 → 28).
        last_intro = INDOCTRINATION_STEPS[-1]["day_offset"]
        day_offset = last_intro + 14 + (i * 14)
        steps.append(
            {
                "index": i,
                "day_offset": day_offset,
                "slug": f"{i + 1:02d}-lesson",
                "subject": f"Lesson {i + 1} of 26: {title}",
                "title": title,
            }
        )
    return steps


# Founders offsets are seconds from enrollment (SQS DelaySeconds max 900s).
SQS_MAX_DELAY_SECONDS = 900

FOUNDERS_STEPS = [
    {"index": 0, "delay_seconds": 0, "slug": "01-welcome", "subject": "Welcome to the Founders Circle!"},
    {"index": 1, "delay_seconds": 5 * 60, "slug": "02-discord", "subject": "Your Founders Discord Invite"},
    {"index": 2, "delay_seconds": 2 * 60 * 60, "slug": "03-vault", "subject": "Your Founders Vault is Ready"},
    {"index": 3, "delay_seconds": 24 * 60 * 60, "slug": "04-onboarding", "subject": "Have you scheduled your onboarding call?"},
    {"index": 4, "delay_seconds": 7 * 24 * 60 * 60, "slug": "05-week1", "subject": "How's your first week going?"},
    {"index": 5, "delay_seconds": 30 * 24 * 60 * 60, "slug": "06-day30", "subject": "30 days in - let's celebrate your wins"},
    {"index": 6, "delay_seconds": 50 * 24 * 60 * 60, "slug": "07-guarantee", "subject": "10 days left on your guarantee"},
]

TRIPWIRE_STEPS = [
    {"index": 0, "day_offset": 0, "slug": "00-receipt", "subject": "Your Digital Marketing Domination ebook is ready"},
    {"index": 1, "day_offset": 2, "slug": "01-membership", "subject": "Want the full training library?"},
]

PAID_BUYER_STEPS = [
    {"index": 0, "day_offset": 0, "slug": "00-welcome", "subject": "Welcome — here's how to get your first win"},
]

LIST_RESTART_STEPS = [
    {
        "index": 0,
        "day_offset": 0,
        "slug": "00-reset",
        "subject": "A reset (and an honest one)",
    },
]


def _with_template(steps, folder):
    out = []
    for step in steps:
        item = dict(step)
        item["template_key"] = f"{folder}/{step['slug']}.html"
        out.append(item)
    return out


SEQUENCES = {
    "indoctrination": {
        "id": "indoctrination",
        "name": "Lead magnet indoctrination",
        "engine": "due_worker",
        "next_sequence": "dmd_course_26",
        "next_delay_days": 14,
        "steps": _with_template(INDOCTRINATION_STEPS, "indoctrination"),
    },
    "dmd_course_26": {
        "id": "dmd_course_26",
        "name": "Digital Marketing Domination 26-lesson course",
        "engine": "due_worker",
        "next_sequence": None,
        "steps": _with_template(_dmd_course_steps(), "dmd_course"),
    },
    "founders_annual": {
        "id": "founders_annual",
        "name": "Founders Annual onboarding",
        "engine": "step_functions",
        "next_sequence": None,
        "steps": _with_template(FOUNDERS_STEPS, "founders"),
    },
    "tripwire_buyer": {
        "id": "tripwire_buyer",
        "name": "Tripwire ebook follow-up",
        "engine": "due_worker",
        "next_sequence": None,
        "steps": _with_template(TRIPWIRE_STEPS, "tripwire"),
    },
    "paid_buyer": {
        "id": "paid_buyer",
        "name": "Paid membership / reseller welcome",
        "engine": "due_worker",
        "next_sequence": None,
        "steps": _with_template(PAID_BUYER_STEPS, "paid"),
    },
    "list_restart": {
        "id": "list_restart",
        "name": "List restart after ESP move",
        "engine": "due_worker",
        "next_sequence": "dmd_course_26",
        "next_delay_days": 3,
        "steps": _with_template(LIST_RESTART_STEPS, "list_restart"),
    },
}


def get_sequence(sequence_id: str) -> dict:
    seq = SEQUENCES.get(sequence_id)
    if not seq:
        raise KeyError(f"Unknown sequence: {sequence_id}")
    return deepcopy(seq)


def lead_magnet_calendar() -> list[dict]:
    """Flatten indoctrination + 26-lesson course onto one dayOfCycle timeline."""
    calendar = []
    for step in SEQUENCES["indoctrination"]["steps"]:
        calendar.append(
            {
                **step,
                "sequence_id": "indoctrination",
            }
        )
    for step in SEQUENCES["dmd_course_26"]["steps"]:
        calendar.append(
            {
                **step,
                "sequence_id": "dmd_course_26",
            }
        )
    calendar.sort(key=lambda s: (s["day_offset"], s["index"]))
    return calendar


def delay_to_next_step(steps: list[dict], current_index: int) -> int | None:
    """Seconds from the current step to the next, or None if the sequence is done."""
    if current_index + 1 >= len(steps):
        return None
    current = int(steps[current_index].get("delay_seconds") or 0)
    nxt = int(steps[current_index + 1].get("delay_seconds") or 0)
    return max(0, nxt - current)


def next_founders_action(delay_seconds: int | None) -> str:
    """sqs (DelaySeconds), due_worker (next_send_at), or complete."""
    if delay_seconds is None:
        return "complete"
    if delay_seconds <= SQS_MAX_DELAY_SECONDS:
        return "sqs"
    return "due_worker"


def sequence_rows_for_db() -> list[dict]:
    rows = []
    for seq in SEQUENCES.values():
        rows.append(
            {
                "id": seq["id"],
                "name": seq["name"],
                "engine": seq["engine"],
                "next_sequence": seq.get("next_sequence"),
                "next_delay_days": seq.get("next_delay_days"),
                "steps": seq["steps"],
            }
        )
    return rows
