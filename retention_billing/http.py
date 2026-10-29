"""Explicitly composed retention-only WSGI app; never registered by server.py.

No environment discovery, database setup, binding creation, or provider writes.
The operator supplies a scoped provider, reviewed policy and transaction factory.
"""
from flask import Flask, jsonify, request
import stripe

from .events import EventHandler
from .types import ReviewRequired, RetryRequired


def create_app(*, connect, provider, endpoint_secret, policy):
    handler = EventHandler(connect, provider, endpoint_secret, policy)
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 1024 * 1024

    @app.after_request
    def no_cache(response):
        response.headers['Cache-Control'] = 'no-store'
        return response

    @app.post('/webhook/retention')
    def ingest():
        signature = request.headers.get('Stripe-Signature')
        if not signature:
            return jsonify(status='invalid_signature'), 400
        raw = request.get_data(cache=False)
        try:
            result = handler.handle(raw, signature)
        except stripe.error.SignatureVerificationError:
            return jsonify(status='invalid_signature'), 400
        except ReviewRequired:
            # No durable hold exists for event-level rejection. Do not ACK it.
            return jsonify(status='event_requires_review'), 409
        except RetryRequired:
            return jsonify(status='retry_required'), 503
        except (ValueError, KeyError, TypeError, AttributeError):
            return jsonify(status='invalid_event'), 400
        except Exception:
            # Database/transport failures must retry, without leaking payloads,
            # provider identifiers, credentials, or exception text to the caller.
            return jsonify(status='retry_required'), 503
        if result == 'unmatched_review':
            return jsonify(status='binding_requires_review'), 503
        if result not in {'recorded', 'duplicate', 'review', 'no_extension', 'unchanged', 'ignored'}:
            return jsonify(status='retry_required'), 503
        return jsonify(status=result), 200

    return app
