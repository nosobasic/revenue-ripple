"""Offline evidence parser prototype. No network, credentials, API client or routes.

Only synthetic fixtures exercise this module. It does not itself run a scan.
"""
import re
from urllib.parse import urlparse


def public_http_url(value):
    if not isinstance(value, str):
        return None
    parsed = urlparse(value)
    if parsed.scheme not in ('https', 'http') or not parsed.hostname or parsed.username or parsed.password:
        return None
    return value


def host_matches(url, domain):
    host = (urlparse(url).hostname or '').lower().rstrip('.')
    target = domain.lower().rstrip('.')
    return host == target or host.endswith('.' + target)


def parse_evidence(response, *, prompt, business_name, domain, observed_at):
    if response.get('status') != 'completed':
        raise ValueError('Incomplete provider response; do not treat as a nonmention.')
    searches = [item for item in response.get('output', []) if item.get('type') == 'web_search_call']
    if len(searches) != 1 or any(item.get('status') != 'completed' for item in searches):
        raise ValueError('A completed search is required.')
    blocks = [part for item in response.get('output', []) if item.get('type') == 'message'
              for part in item.get('content', []) if part.get('type') == 'output_text']
    answer = '\n'.join(part['text'] for part in blocks)
    if not answer.strip():
        raise ValueError('No answer text; do not consume a completed scan credit.')
    citations = []
    for part in blocks:
        for annotation in part.get('annotations', []):
            if annotation.get('type') != 'url_citation':
                continue
            url = public_http_url(annotation.get('url'))
            start, end = annotation.get('start_index'), annotation.get('end_index')
            if url and isinstance(start, int) and isinstance(end, int) and 0 <= start < end <= len(part['text']):
                citations.append({'url': url, 'title': annotation.get('title', ''),
                                  'cited_span': part['text'][start:end]})
    consulted = []
    for search in searches:
        for source in search.get('action', {}).get('sources', []):
            url = public_http_url(source.get('url'))
            if url:
                consulted.append(url)
    # Name matches are explicitly candidates: e.g. Apple can mean several entities.
    match = re.search(r'(?<!\w)' + re.escape(business_name) + r'(?!\w)', answer, re.IGNORECASE)
    return {
        'provider': 'OpenAI API', 'model': response.get('model'),
        'response_id': response.get('id'), 'prompt': prompt, 'observed_at': observed_at,
        'answer': answer, 'name_match': bool(match),
        'name_match_excerpt': answer[max(0, match.start()-70):match.end()+130] if match else None,
        'domain_cited': any(host_matches(c['url'], domain) for c in citations),
        'citations': citations, 'consulted_sources': list(dict.fromkeys(consulted)),
        'usage': response.get('usage'),
        'interpretation': 'One API observation. A name match may be ambiguous. Consulted sources are not necessarily cited. No consumer-app ranking or visibility probability is inferred.',
    }
