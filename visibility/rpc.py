"""Small stdlib PostgREST transport, usable on Lambda or another worker."""
import json
from urllib.request import Request, urlopen

class RPC:
    def __init__(self, base_url, token, timeout=8, api_key=None):
        self.api_key=api_key or token
        self.base_url=base_url.rstrip('/');self.token=token;self.timeout=timeout
    def call(self, name, **parameters):
        request=Request(self.base_url+'/rest/v1/rpc/'+name,
                        data=json.dumps(parameters).encode(),method='POST',
                        headers={'Content-Type':'application/json','Authorization':'Bearer '+self.token,'apikey':self.api_key})
        with urlopen(request,timeout=self.timeout) as response:
            return json.load(response)
