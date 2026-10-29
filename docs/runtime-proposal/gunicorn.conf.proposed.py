"""Review-only configuration. No imports, service registration or activation."""
workers = 2
worker_class = 'sync'
timeout = 35
graceful_timeout = 5
preload_app = False
max_requests = 1000
max_requests_jitter = 100
errorlog = '-'
# Dedicated ingress access records can include provider data in query strings.
accesslog = None

# Proposed command after approval (retain existing platform PORT binding):
# gunicorn -c docs/runtime-proposal/gunicorn.conf.proposed.py \
#   'retention_billing.runtime:create_application()' --bind 0.0.0.0:$PORT
# RR_BILLING_ENABLED defaults false. This file does not provide credentials.
