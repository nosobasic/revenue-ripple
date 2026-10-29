"""Main-server billing bootstrap + real disposable DB; offline provider only."""
import unittest
import test_retention_writer_boundary as boundary
import test_retention_integration as fixture
from test_retention_durable import DurableBilling
from test_retention_server import bootstrap
from retention_billing.policy import PaidPolicy


class ServerDatabase(unittest.TestCase):
    @classmethod
    def setUpClass(cls): boundary.WriterBoundary.setUpClass()

    def test_server_receipt_worker_entitlement_and_redelivery(self):
        boundary.WriterBoundary.setUp(self)
        def restricted():
            con = fixture.connect()
            con.execute('SET ROLE rr_retention_writer_test')
            con.commit()
            return con
        app, factory = bootstrap()
        self.secret = 'offline-server-database-secret'
        factory(connect=restricted, provider=self.provider, endpoint_secret=self.secret, policy=PaidPolicy())
        self.client = app.test_client()
        worker = app.extensions['retention_billing']['worker']
        self.assertEqual(DurableBilling.send(self).json, {'status':'accepted'})
        self.assertEqual(worker.run_once(), 'recorded')
        self.assertEqual(fixture.Integration.api(self).status_code, 200)
        self.assertEqual(DurableBilling.send(self).json, {'status':'accepted'})
        self.assertEqual(worker.run_once(), 'idle')
        self.assertEqual(worker.queue.counts(), {'done':1})
