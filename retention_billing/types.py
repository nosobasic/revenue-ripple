from dataclasses import dataclass
class ReviewRequired(Exception): pass
class RetryRequired(Exception): pass
def object_id(value): return value.get('id') if isinstance(value,dict) else value
@dataclass(frozen=True)
class Scope:
    account: str
    live: bool
    api_version: str = '2025-03-31.basil'
@dataclass(frozen=True)
class Binding:
    scope: Scope
    subscription: str
    customer: str
    user_id: str
    price: str
    product: str
LIVE_SCOPE=Scope('acct_1RHozW2Ku9STqdAd',True)
LIVE_CATALOG=('price_1RI8Me2Ku9STqdAdhTw4iWhS','prod_SCXRGL4GsjEZCY')
