"""No network: verify user-token delegation and aggregate response boundary."""
import copy
import os
import unittest
from unittest.mock import patch, Mock
from email_crm.reporting_rpc import read_snapshot, sanitize_snapshot, ReportingAccessDenied


def response():
    return {'contract_version':1,'days':7,'generated_at':'2026-10-11T12:00:00Z','window_start':'2026-10-04T12:00:00Z','window_end':'2026-10-11T12:00:00Z',
        'classification':{'status':'available'},'delivery':{'status':'available','counts':{'accepted':2,'send':2,'delivery':1,'bounced':0,'transient_bounce':0,'complained':0,'reject':0},
        'daily':[{'day':'2026-10-10','accepted':2,'delivered':1}], 'messages':[{'sequence':'indoctrination','step':1,'accepted':2,'delivered':1,'hard_bounces':0,'complaints':0}],
        'last_feedback_recorded_at':None,'operations':dict.fromkeys(['uncertain','retryable','blocked','sending','claimed'],0)},
        'list':{'status':'available','total':1,'eligible':1,'suppressed':0,'review':0,'unsubscribed_in_window':0,'growth':None,'legacy_exclusion_addresses':1494,'manifest_ready':True}}

class RPCBoundary(unittest.TestCase):
    def setUp(self):
        self.env=patch.dict(os.environ,{'SUPABASE_URL':'https://fixture.invalid','SUPABASE_SERVICE_ROLE_KEY':'offline-gateway-marker'},clear=True);self.env.start();self.addCleanup(self.env.stop)
        self.network=patch('email_crm.reporting_rpc.requests.post');self.post=self.network.start();self.addCleanup(self.network.stop)
        self.post.return_value=Mock(status_code=200,json=lambda:response())
    def test_user_bearer_not_service_identity_and_no_actor_argument(self):
        result=read_snapshot('verified-user-token',7)
        self.assertEqual(result['delivery']['counts']['accepted'],2)
        url=self.post.call_args.args[0];kw=self.post.call_args.kwargs
        self.assertEqual(url,'https://fixture.invalid/rest/v1/rpc/email_reporting_snapshot')
        self.assertEqual(kw['headers']['Authorization'],'Bearer verified-user-token')
        self.assertEqual(kw['headers']['apikey'],'offline-gateway-marker')
        self.assertEqual(kw['json'],{'p_days':7});self.assertFalse(kw['allow_redirects']);self.assertEqual(kw['timeout'],12)
    def test_missing_rpc_timeout_and_malformed_fail_closed_without_scan_fallback(self):
        for failure in [RuntimeError('private error fixture@example.test'),TimeoutError()]:
            self.post.side_effect=failure
            self.assertEqual(read_snapshot('verified',7)['classification']['status'],'unavailable')
        self.post.side_effect=None
        self.post.return_value=Mock(status_code=200,json=lambda:{'private':'fixture@example.test'})
        self.assertEqual(read_snapshot('verified',7)['delivery'],{'status':'unavailable'})
    def test_database_role_revocation_rejected(self):
        for status in [401,403]:
            self.post.return_value=Mock(status_code=status)
            with self.assertRaises(ReportingAccessDenied):read_snapshot('verified',7)
    def test_unexpected_fields_cannot_leak(self):
        raw=response();raw['notes']=['fixture@example.test'];raw['private']={'contact_id':'private-id'}
        raw['delivery']['messages'][0]['recipient']='fixture@example.test'
        result=sanitize_snapshot(raw,7)
        self.assertNotIn('fixture@example.test',str(result));self.assertNotIn('private-id',str(result))
        self.assertEqual(result['engagement']['status'],'unavailable');self.assertIsNone(result['list']['growth'])
    def test_invalid_counts_cohorts_and_group_strings_rejected(self):
        for mutate in [lambda r:r['delivery']['counts'].update(accepted=-1),lambda r:r['delivery']['counts'].update(delivery=3),
                       lambda r:r['delivery']['counts'].update(accepted=True),lambda r:r['delivery']['messages'][0].update(sequence='secret@example.test'),
                       lambda r:r.update(contract_version=999),lambda r:r['delivery'].update(daily=[r['delivery']['daily'][0]]*9)]:
            raw=response();mutate(raw)
            with self.assertRaises((ValueError,KeyError)):sanitize_snapshot(raw,7)
    def test_no_token_or_insecure_destination_never_calls_network(self):
        read_snapshot('',7);self.post.assert_not_called()
        os.environ['SUPABASE_URL']='http://fixture.invalid'
        read_snapshot('verified',7);self.post.assert_not_called()

if __name__=='__main__':unittest.main()
