"""Opt-in runtime dependency composition; no credentials are read on import."""
from dataclasses import dataclass, field
import os
from .types import Scope, LIVE_SCOPE, LIVE_CATALOG


class ConfigurationError(ValueError):
    pass


@dataclass(frozen=True)
class Settings:
    scope: Scope
    catalog: tuple[str, str]
    database_dsn: str = field(repr=False)
    read_key: str = field(repr=False)
    signing_secret: str = field(repr=False)


def read_settings(environ=None):
    env = os.environ if environ is None else environ
    enabled = env.get('RR_BILLING_ENABLED', 'false')
    if enabled == 'false':
        return None
    if enabled != 'true':
        raise ConfigurationError('invalid_activation_flag')
    names = ('ACCOUNT_ID', 'MODE', 'API_VERSION', 'PRICE_ID', 'PRODUCT_ID',
             'DATABASE_DSN', 'READ_KEY', 'SIGNING_SECRET')
    values = {name: env.get('RR_BILLING_'+name, '') for name in names}
    if any(not isinstance(value, str) or not value.strip() for value in values.values()):
        raise ConfigurationError('incomplete_billing_configuration')
    if values['MODE'] not in {'live', 'sandbox'} or values['API_VERSION'] != LIVE_SCOPE.api_version:
        raise ConfigurationError('invalid_billing_scope')
    scope = Scope(values['ACCOUNT_ID'], values['MODE'] == 'live', values['API_VERSION'])
    catalog = (values['PRICE_ID'], values['PRODUCT_ID'])
    if not scope.account.startswith('acct_') or not catalog[0].startswith('price_') or not catalog[1].startswith('prod_'):
        raise ConfigurationError('invalid_billing_identity')
    if scope.live and (scope != LIVE_SCOPE or catalog != LIVE_CATALOG):
        raise ConfigurationError('unapproved_live_catalog')
    # Only dedicated restricted keys; never accept the legacy general-purpose key.
    prefix = 'rk_live_' if scope.live else 'rk_test_'
    if not values['READ_KEY'].startswith(prefix) or not values['SIGNING_SECRET'].startswith('whsec_'):
        raise ConfigurationError('invalid_credential_kind')
    return Settings(scope, catalog, values['DATABASE_DSN'], values['READ_KEY'], values['SIGNING_SECRET'])


def build_dependencies(settings):
    """Construct clients without connecting; all DB transactions get fixed limits.

    Actual read-only key permissions and database principal grants remain external
    review gates. Prefixes cannot prove those permissions.
    """
    import psycopg
    from psycopg.conninfo import conninfo_to_dict
    import stripe
    from .policy import PaidPolicy
    from .stripe_adapter import StripeReadAdapter
    try:
        params = conninfo_to_dict(settings.database_dsn)
    except Exception:
        raise ConfigurationError('invalid_database_configuration') from None
    # No implicit PG* values, service files, passfiles, or Unix-socket/host fallback.
    allowed = {'host', 'port', 'dbname', 'user', 'password', 'sslrootcert', 'sslmode'}
    if (set(params) - allowed or not all(params.get(k) for k in ('host','dbname','user','password','sslrootcert'))
            or params['host'].startswith('/') or ',' in params['host']
            or params.get('sslmode') != 'verify-full'
            or params['user'] in {'postgres','service_role','rr_retention_writer'}):
        raise ConfigurationError('invalid_database_boundary')
    if any(key.startswith('PG') for key in os.environ):
        raise ConfigurationError('ambient_database_configuration_forbidden')
    params.update(connect_timeout=5, options='-c lock_timeout=5000 -c statement_timeout=30000',
                  application_name='rr-retention-billing')
    def connect():
        return psycopg.connect(**params, autocommit=False)
    client = stripe.StripeClient(settings.read_key,
        http_client=stripe.RequestsClient(timeout=10), max_network_retries=0)
    return dict(connect=connect, provider=StripeReadAdapter(client, settings.scope),
                endpoint_secret=settings.signing_secret, policy=PaidPolicy(settings.scope, settings.catalog))


def create_application(environ=None, *, dependencies_factory=build_dependencies, server_module=None):
    """Gunicorn factory: retention_billing.runtime:create_application().

    Default remains server:app with disabled ingress. No worker is started here.
    A dedicated RR_BILLING_* namespace is read only when explicitly enabled.
    """
    settings = read_settings(environ)
    dependencies = dependencies_factory(settings) if settings is not None else None
    if server_module is None:
        import server as server_module
    if dependencies is None:
        return server_module.app
    return server_module.create_retention_server(**dependencies)


def create_worker(settings):
    from .durable import create_durable_app
    _, worker = create_durable_app(**build_dependencies(settings))
    return worker
