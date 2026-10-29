"""Explicit main-server composition; disabled without injected dependencies.

The isolated ingress owns only its exact path. No environment discovery, schema
setup, provider calls, worker loop, or legacy webhook replacement occurs here.
"""
from werkzeug.wrappers import Response

PATH = '/webhook/retention'


class RetentionIngress:
    def __init__(self, application, ingress=None):
        self.application = application
        self.ingress = ingress
        self.started = False

    def __call__(self, environ, start_response):
        self.started = True
        if environ.get('PATH_INFO') == PATH:
            if self.ingress is not None:
                return self.ingress(environ, start_response)
            return Response('{"status":"billing_ingestion_disabled"}', status=503,
                            content_type='application/json',
                            headers={'Cache-Control': 'no-store'})(environ, start_response)
        return self.application(environ, start_response)


def install_retention_billing(app, *, enabled=False, connect=None, provider=None,
                             endpoint_secret=None, policy=None):
    """Install at startup only; return an explicit one-step worker when enabled.

    A disabled installation may be configured once by the server factory before
    requests. Enabling never starts the worker. Configuration errors stop startup.
    """
    if type(enabled) is not bool:
        raise ValueError('billing_enabled_must_be_boolean')
    if app._got_first_request:
        raise RuntimeError('billing_configuration_requires_restart')
    previous = app.extensions.get('retention_billing')
    if isinstance(app.wsgi_app, RetentionIngress) and app.wsgi_app.started:
        raise RuntimeError('billing_configuration_requires_restart')
    if previous is not None and previous['worker'] is not None:
        raise RuntimeError('billing_already_configured')
    ingress = worker = None
    if enabled:
        if (not callable(connect) or provider is None or policy is None
                or not isinstance(endpoint_secret, str) or not endpoint_secret.strip()):
            raise ValueError('incomplete_billing_configuration')
        # Optional database dependencies are not imported by the disabled server.
        from .durable import create_durable_app
        ingress, worker = create_durable_app(connect=connect, provider=provider,
                                            endpoint_secret=endpoint_secret, policy=policy)
    elif any(value is not None for value in (connect, provider, endpoint_secret, policy)):
        raise ValueError('disabled_billing_has_dependencies')
    original = previous['original'] if previous is not None else app.wsgi_app
    app.wsgi_app = RetentionIngress(original, ingress)
    app.extensions['retention_billing'] = {'original': original, 'worker': worker}
    return worker
