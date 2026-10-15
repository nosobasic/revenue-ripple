import hashlib
import ipaddress
import json
from urllib.parse import urlparse


def prepare(data):
    if not isinstance(data, dict):
        raise ValueError('Enter your business, website, and customer topic.')
    result = {}
    for key, maximum in [('business_name',100),('domain',253),('topic',240)]:
        value=data.get(key)
        if not isinstance(value,str) or not value.strip() or len(value)>maximum:
            raise ValueError(f'{key} is required, up to {maximum} characters.')
        result[key]=value.strip()
    parsed=urlparse(result['domain'] if '://' in result['domain'] else 'https://'+result['domain'])
    host=(parsed.hostname or '').lower().rstrip('.')
    if parsed.scheme not in ('http','https') or parsed.username or parsed.password or parsed.port:
        raise ValueError('Enter a public website domain.')
    try:
        ipaddress.ip_address(host)
    except ValueError:
        pass
    else:
        raise ValueError('Use a website domain, not an IP address.')
    if '.' not in host or host.endswith(('.local','.internal','.localhost')):
        raise ValueError('Enter a public website domain.')
    result['domain']=host.encode('idna').decode('ascii')
    topic=result['topic']
    prompts=[
        f'Which businesses or services would you recommend for {topic}? Explain fit and cite sources.',
        f'What should someone compare when choosing a provider for {topic}? Give specific examples and cite sources.',
        f'Which alternatives are worth considering for {topic}, and why? Cite sources.',
    ]
    fingerprint=hashlib.sha256(json.dumps({'input':result,'prompts':prompts,'version':1},sort_keys=True).encode()).hexdigest()
    return result,prompts,fingerprint


def actions_for(evidence):
    missing=[e for e in evidence if not e['domain_cited']]
    ambiguous=[e for e in evidence if e['name_match'] and not e['domain_cited']]
    cited=next((c for e in evidence for c in e['citations']),None)
    return [
        {'title':'Answer the customer question directly',
         'action':'Review your page for a clear, factual answer to this question. Add useful service details if they are missing; this check did not audit your page.',
         'evidence':f"Your domain was not cited for: {missing[0]['prompt']}" if missing else 'Your domain was cited in these responses. Review whether the cited page answers the customer question fully.'},
        {'title':'Verify your business identity',
         'action':'Check that the name, website, service area and contact details in relevant sources describe your business. A matching name can refer to another entity.',
         'evidence':f"A name match needs checking: {ambiguous[0]['name_match_excerpt']}" if ambiguous else 'Manual follow-up: this snapshot does not establish that every business name identifies the correct entity.'},
        {'title':'Review the evidence behind the answer',
         'action':'Open the cited source and check its accuracy. If a claim is outdated, strengthen your first-party explanation with current evidence.' if cited else 'Manually compare this question with a fresh search in your chosen assistant and save its answer and date.',
         'evidence':f"Cited source: {cited['title'] or cited['url']}" if cited else 'No usable citation was returned. This is a manual follow-up, not a source-quality finding.',
         'source_url':cited['url'] if cited else None},
    ]
