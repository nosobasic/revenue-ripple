import importlib.util
import os
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location('attribution', Path(__file__).resolve().parents[2] / 'acquisition/attribution.py')
a = importlib.util.module_from_spec(spec)
spec.loader.exec_module(a)
TOUCH = '00000000-0000-4000-8000-000000000001'

class AttributionTests(unittest.TestCase):
    def event(self, paid='paid', amount=500):
        return {'type':'checkout.session.completed','data':{'object':{'id':'cs_1','payment_status':paid,'amount_total':amount,'currency':'USD','customer_details':{'email':' A@EXAMPLE.COM '}}}}

    @patch.dict(os.environ, {'ACQUISITION_ATTRIBUTION_ENABLED':'true'})
    def test_paid_checkout_uses_stable_session_key_and_minor_units(self):
        db=Mock(); a.record_checkout(db,self.event())
        db.rpc.assert_called_once_with('acquisition_record_conversion', {'p_event':'stripe:checkout:cs_1','p_email':'a@example.com','p_amount':500,'p_currency':'usd'})

    @patch.dict(os.environ, {'ACQUISITION_ATTRIBUTION_ENABLED':'true'})
    def test_unpaid_and_zero_checkouts_are_not_revenue(self):
        db=Mock();a.record_checkout(db,self.event('unpaid'));a.record_checkout(db,self.event(amount=0));db.rpc.assert_not_called()

    @patch.dict(os.environ, {'ACQUISITION_ATTRIBUTION_ENABLED':'true'})
    def test_conversion_failure_is_retryable(self):
        db=Mock();db.rpc.side_effect=RuntimeError('database down')
        with self.assertRaises(RuntimeError):a.record_checkout(db,self.event())

    @patch.dict(os.environ, {'ACQUISITION_ATTRIBUTION_ENABLED':'true'})
    def test_lead_failure_does_not_break_nurture(self):
        db=Mock();db.rpc.side_effect=RuntimeError('database down')
        with self.assertLogs(a.logger,level='ERROR'):
            a.record_lead(db,'a@example.com','guide',{'acquisition':{'first_touch_id':TOUCH}})

    @patch.dict(os.environ, {'ACQUISITION_ATTRIBUTION_ENABLED':'false'})
    def test_rollout_disabled_makes_no_database_calls(self):
        db=Mock();a.record_checkout(db,self.event());a.record_lead(db,'a@example.com','guide',{'acquisition':{'first_touch_id':TOUCH}});db.rpc.assert_not_called()

    def test_checkout_metadata_discards_invalid_ids(self):
        self.assertEqual(a.checkout_metadata({'acquisition':{'first_touch_id':'invalid','last_touch_id':TOUCH}}),{'rr_last_touch':TOUCH})

    @patch.dict(os.environ, {'ACQUISITION_ATTRIBUTION_ENABLED':'true'})
    def test_checkout_updates_last_touch_before_conversion(self):
        db=Mock();event=self.event();event['data']['object']['metadata']={'rr_last_touch':TOUCH};a.record_checkout(db,event)
        self.assertEqual(db.rpc.call_args_list[0].args[0],'acquisition_record_lead')
        self.assertEqual(db.rpc.call_args_list[1].args[0],'acquisition_record_conversion')

if __name__ == '__main__': unittest.main()
