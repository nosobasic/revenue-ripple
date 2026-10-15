import unittest
from unittest.mock import MagicMock
from retention_reconciliation import Reconciler
from retention_fixture import documents,provider,USER
from retention_billing.types import LIVE_CATALOG
class ReadOnly(unittest.TestCase):
 def reader(self,rows):
  con=MagicMock();con.__enter__.return_value.autocommit=False
  cur=con.__enter__.return_value.cursor.return_value.__enter__.return_value;cur.fetchone.side_effect=rows
  return Reconciler(lambda:con,provider(documents())),cur
 def test_proposal_and_only_reads(self):
  r,c=self.reader([('cus_fixture',*LIVE_CATALOG),None,(__import__('time').time(),)])
  self.assertEqual(r.inspect(USER,'sub_fixture','in_fixture')['state'],'eligible_proposal')
  self.assertEqual(c.execute.call_args_list[0].args,('SET TRANSACTION READ ONLY',))
  self.assertTrue(all(call.args[0].startswith(('SELECT','SET TRANSACTION READ ONLY')) for call in c.execute.call_args_list))
 def test_missing_and_hold(self):
  for rows in [[None],[('cus_fixture',*LIVE_CATALOG),(1,)]]:
   r,c=self.reader(rows);self.assertEqual(r.inspect(USER,'sub_fixture','in_fixture'),{'state':'review'})
 def test_identity_parameterized(self):
  r,c=self.reader([None]);r.inspect("x';drop table users;--",'sub_fixture')
  self.assertEqual(c.execute.call_args_list[1].args[1][0],"x';drop table users;--")
