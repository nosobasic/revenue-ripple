#!/usr/bin/env python3
"""Convert Desktop 26 Lessons ODT files into email_crm + local email-content HTML."""

from __future__ import annotations

import re
import zipfile
import xml.etree.ElementTree as ET
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = Path("/Users/donte/Desktop/revenue ripple files/26 Lessons")
SEND_DIR = ROOT / "email_crm" / "templates" / "dmd_course"
LOCAL_DIR = ROOT / "email-content" / "dmd_course"

TEXT_NS = "urn:oasis:names:tc:opendocument:xmlns:text:1.0"
OFFICE_NS = "urn:oasis:names:tc:opendocument:xmlns:office:1.0"
NS = {"office": OFFICE_NS, "text": TEXT_NS}

SEO_LINKS = {
    "Google Keyword Planner": "https://ads.google.com/home/tools/keyword-planner/",
    "SEMrush": "https://www.semrush.com/",
    "Ahrefs": "https://ahrefs.com/",
    "Moz Keyword Explorer": "https://moz.com/explorer",
    "Ubersuggest": "https://neilpatel.com/ubersuggest/",
}

DMD_URL = "{{app_base_url}}/DMD"
MEMBERSHIP_URL = "{{app_base_url}}/"


def local_name(tag: str) -> str:
    return tag.split("}", 1)[-1]


def inner_text(el: ET.Element) -> str:
    parts: list[str] = []
    if el.text:
        parts.append(el.text)
    for child in el:
        name = local_name(child.tag)
        if name == "s":
            count = int(child.get(f"{{{TEXT_NS}}}c") or "1")
            parts.append(" " * count)
        elif name in {"line-break", "tab", "soft-page-break"}:
            parts.append(" ")
        else:
            parts.append(inner_text(child))
        if child.tail:
            parts.append(child.tail)
    return "".join(parts)


def collapse(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _wrap_url(match: re.Match) -> str:
    url = match.group(1)
    stripped = url.rstrip(".,);:")
    trail = url[len(stripped) :]
    return f'<a href="{stripped}">{stripped}</a>{trail}'


def linkify(text: str) -> str:
    for name, url in SEO_LINKS.items():
        if name in text and "[PROVIDE LINK]" in text:
            text = text.replace("[PROVIDE LINK]", url, 1)
            break
    text = text.replace("[contact email]", "support@revenueripple.org")
    text = text.replace("[First Name]", "{{first_name}}")
    text = text.replace("[Your Name]", "Donte")
    text = re.sub(
        r"\(PUT YOUR DIGITAL\s*MARKETING DOMINATION AFFILIATE LINK HERE\)",
        "(@@DMD@@)",
        text,
        flags=re.I,
    )
    text = text.replace(
        "[Your affiliate/reseller link to sign up to the membership]",
        "@@MEMBERSHIP@@",
    )
    text = text.replace("sign uptoour", "sign up to our")
    text = text.replace("look overourshoulder", "look over our shoulder")
    text = re.sub(r"\(LINK NAME\s+(https?://[^\s)]+)\)", r"(\1)", text)
    html = escape(text, quote=False)
    html = html.replace("[PROVIDE LINK]", "<em>[link needed]</em>")
    html = re.sub(
        r"(https?://[^\s<]+)",
        _wrap_url,
        html,
    )
    html = html.replace("@@DMD@@", f'<a href="{DMD_URL}">{DMD_URL}</a>')
    html = html.replace(
        "@@MEMBERSHIP@@",
        f'<a href="{MEMBERSHIP_URL}">{MEMBERSHIP_URL}</a>',
    )
    return html


def merge_adjacent_lists(blocks: list[str]) -> list[str]:
    merged: list[str] = []
    for block in blocks:
        if block.startswith("<ul>") and merged and merged[-1].startswith("<ul>"):
            prev = merged[-1]
            cut = prev.rfind("</ul>")
            start = block.find("<li>")
            if cut != -1 and start != -1:
                merged[-1] = prev[:cut] + block[start:]
                continue
        merged.append(block)
    return merged


def convert_list(el: ET.Element) -> str:
    items: list[str] = []
    for li in list(el):
        if local_name(li.tag) != "list-item":
            continue
        chunks: list[str] = []
        for child in li:
            name = local_name(child.tag)
            if name == "p":
                t = collapse(inner_text(child))
                if t:
                    chunks.append(linkify(t))
            elif name == "list":
                nested = convert_list(child)
                if nested:
                    chunks.append(nested)
        if chunks:
            items.append("<li>" + " ".join(chunks) + "</li>")
    if not items:
        return ""
    return "<ul>\n" + "\n".join(items) + "\n</ul>"


def extract_subject(paras: list[str]) -> str:
    for p in paras[:6]:
        m = re.match(r"Subject:\s*(.+)", p, re.I)
        if m:
            subj = m.group(1).strip()
            subj = re.sub(r"^Lesson\s+\d+\s+of\s+26:\s*", "", subj, flags=re.I)
            return re.sub(r"\s+", " ", subj).strip()
    return ""


def odt_to_html(path: Path) -> tuple[str, str]:
    with zipfile.ZipFile(path) as zf:
        xml = zf.read("content.xml")
    root = ET.fromstring(xml)
    body = root.find("office:body/office:text", NS)
    if body is None:
        raise RuntimeError(f"No office:text in {path}")

    blocks: list[str] = []
    raw_paras: list[str] = []
    skipped_header = False
    subject = ""

    for child in body:
        name = local_name(child.tag)
        if name == "p":
            text = collapse(inner_text(child))
            if not text:
                continue
            raw_paras.append(text)
            if not skipped_header:
                if re.match(r"Lesson\s+\d+\s+of\s+26", text, re.I):
                    continue
                if text.lower().startswith("subject:"):
                    subject = extract_subject([text])
                    skipped_header = True
                    continue
            blocks.append(f"<p>{linkify(text)}</p>")
        elif name == "list":
            skipped_header = True
            lst = convert_list(child)
            if lst:
                blocks.append(lst)

    if not subject:
        subject = extract_subject(raw_paras)

    html = "\n".join(merge_adjacent_lists(blocks))
    html = re.sub(r"<p>Best regards,</p>\n<p>Donte</p>", "<p>— Donte<br>Revenue Ripple</p>", html)
    return subject, html + "\n"


def main() -> int:
    if not SRC.is_dir():
        print(f"Missing source folder: {SRC}")
        return 1
    SEND_DIR.mkdir(parents=True, exist_ok=True)
    LOCAL_DIR.mkdir(parents=True, exist_ok=True)
    titles: list[str] = []
    for n in range(1, 27):
        src = SRC / f"Lesson {n} of 26.odt"
        subject, html = odt_to_html(src)
        titles.append(subject)
        slug = f"{n:02d}-lesson.html"
        (SEND_DIR / slug).write_text(html, encoding="utf-8")
        (LOCAL_DIR / slug).write_text(html, encoding="utf-8")
        print(f"{slug}: {subject} ({len(html)} chars)")
    print("TITLES =")
    for t in titles:
        print(f"    {t!r},")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
