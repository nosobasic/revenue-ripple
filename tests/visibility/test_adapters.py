import io
import json
import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch
from visibility.providers import OpenAISearchProvider
from visibility.rpc import RPC
from visibility.lambda_handlers import worker_handler

class AdapterTests(unittest.TestCase):
    def test_live_adapter_disabled_without_network(self):
        with patch.dict(os.environ,{'RR_VISIBILITY_ALLOW_LIVE':'false'}),patch('visibility.providers.urlopen') as request:
            with self.assertRaises(RuntimeError):OpenAISearchProvider('synthetic-not-a-key').preflight({'provider':'openai','model':'gpt-4.1-mini'})
            request.assert_not_called()
    def test_lambda_disabled_does_not_read_secrets(self):
        with patch.dict(os.environ,{'RR_VISIBILITY_ALLOW_LIVE':'false'}),patch('visibility.lambda_handlers.configuration') as secret:
            result=worker_handler({'Records':[{'messageId':'m','body':'{}'}]},None)
            self.assertEqual(result,{'batchItemFailures':[{'itemIdentifier':'m'}]});secret.assert_not_called()
    def test_rpc_api_key_is_separate_from_restricted_role_token(self):
        captured=[]
        def response(request,timeout):
            captured.append(request)
            return io.BytesIO(b'{"status":"saved"}')
        with patch('visibility.rpc.urlopen',side_effect=response):
            self.assertEqual(RPC('https://database.example','worker-jwt',api_key='public-project-key').call('rr_v_metrics')['status'],'saved')
        headers={k.lower():v for k,v in captured[0].headers.items()}
        self.assertEqual(headers['authorization'],'Bearer worker-jwt');self.assertEqual(headers['apikey'],'public-project-key')
    def test_request_is_bounded_and_no_retry(self):
        captured=[]
        raw={'status':'completed','output':[{'type':'web_search_call'}],'usage':{'input_tokens':100,'output_tokens':200}}
        def response(request,timeout):
            captured.append((request,timeout));return io.BytesIO(json.dumps(raw).encode())
        with patch('visibility.providers.urlopen',side_effect=response):
            result=OpenAISearchProvider('synthetic-not-a-key').ask('A customer topic','attempt','gpt-4.1-mini')
        payload=json.loads(captured[0][0].data)
        self.assertEqual(payload['max_tool_calls'],1);self.assertEqual(payload['max_output_tokens'],600)
        self.assertEqual(payload['tool_choice'],'required');self.assertFalse(payload['store'])
        self.assertEqual(captured[0][1],20);self.assertEqual(result['cost_kind'],'estimated')
        with patch('visibility.providers.urlopen',side_effect=TimeoutError()) as request:
            with self.assertRaises(TimeoutError):OpenAISearchProvider('synthetic-not-a-key').ask('Topic','attempt','gpt-4.1-mini')
            self.assertEqual(request.call_count,1)

if __name__=='__main__':unittest.main()
