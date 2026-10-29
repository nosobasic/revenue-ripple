"""Synthetic-only tests against the isolated, socket-only CI PostgreSQL."""
import pathlib
import sys
import unittest
import psycopg
root = pathlib.Path(__file__).resolve().parents[2]
sys.path[:0] = [str(root), str(root / 'tests')]
import test_retention_integration as fixture

def connect():
    con = psycopg.connect(host='/tmp/rr-retention-final-socket', port=55439,
                         dbname='postgres', user='donte', connect_timeout=5,
                         options='-c client_encoding=UTF8')
    try:
        assert con.execute('SHOW data_directory').fetchone()[0] == '/var/lib/postgresql/data'
        assert con.execute('SHOW listen_addresses').fetchone()[0] == ''
        assert con.execute('SHOW server_version').fetchone()[0].split()[0] == '17.11'
        con.commit()
        return con
    except BaseException:
        con.close()
        raise
def main():
    fixture.connect = connect
    with connect() as con:
        print('Verified isolated PostgreSQL', con.execute('SELECT version()').fetchone()[0], flush=True)
    names = ['test_retention_runtime', 'test_retention_full_server', 'test_retention_server',
             'test_retention_http', 'test_retention_provider', 'test_retention_reconciliation',
             'test_retention_content', 'test_retention_integration.Integration',
             'test_retention_writer_boundary.WriterBoundary', 'test_retention_durable.DurableBilling',
             'test_retention_server_database.ServerDatabase', 'test_retention_activation.Activation']
    suite = unittest.defaultTestLoader.loadTestsFromNames(names)
    assert suite.countTestCases() == 93, suite.countTestCases()
    generated = root / 'tests/retention/api-allowed-fixture.json'
    original = generated.read_bytes()
    try:
        result = unittest.TextTestRunner(verbosity=2).run(suite)
    finally:
        generated.write_bytes(original)
    sys.exit(not result.wasSuccessful())

if __name__ == "__main__":
    main()
