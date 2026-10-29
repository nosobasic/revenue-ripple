#!/usr/bin/env bash
set -euo pipefail
PY_IMAGE='python@sha256:de63c5645b0def520dd5d6acaa0144ba4994ba99ec21de45e77910375fc17665'
PG_IMAGE='postgres@sha256:2cd2c0f809604aaeff6f0ec8f40aecbd025613107561015c69369a1a7f1d3416'
cleanup() { docker rm -f rr-billing-ci-pg >/dev/null 2>&1 || true; docker volume rm rr-billing-ci-socket >/dev/null 2>&1 || true; }
trap cleanup EXIT
# Official amd64 image digests verified from Docker Library registry metadata.
docker pull --platform linux/amd64 "$PY_IMAGE"
docker pull --platform linux/amd64 "$PG_IMAGE"
docker image inspect --format '{{.Id}} {{.Os}}/{{.Architecture}}' "$PY_IMAGE" "$PG_IMAGE"
docker run --rm --platform linux/amd64 -v "$PWD:/work" -w /work "$PY_IMAGE" bash -ceu '
 python -m venv .ci-venv
 .ci-venv/bin/python -m pip install --no-cache-dir pip==26.2.2 setuptools==84.2.1
 .ci-venv/bin/python -m pip install --no-cache-dir -r requirements.txt
 .ci-venv/bin/python -m pip check
 .ci-venv/bin/python scripts/ci/check_billing_target.py
 .ci-venv/bin/python -m pip freeze
'
docker volume create rr-billing-ci-socket
docker run -d --name rr-billing-ci-pg --platform linux/amd64 --network none \
 --tmpfs /var/lib/postgresql/data -v rr-billing-ci-socket:/tmp/rr-retention-final-socket \
 -e POSTGRES_USER=donte -e POSTGRES_HOST_AUTH_METHOD=trust -e PGPORT=55439 \
 "$PG_IMAGE" bash -ceu 'chown postgres:postgres /tmp/rr-retention-final-socket
 exec docker-entrypoint.sh postgres -p 55439 -c listen_addresses="" -c unix_socket_directories=/var/run/postgresql,/tmp/rr-retention-final-socket'
ready=false
for i in $(seq 1 30); do
 if [[ "$(docker inspect -f '{{.State.Running}}' rr-billing-ci-pg)" != true ]]; then break; fi
 if docker logs rr-billing-ci-pg 2>&1 | grep -q 'PostgreSQL init process complete' && docker exec rr-billing-ci-pg pg_isready -h /tmp/rr-retention-final-socket -p 55439 -U donte; then ready=true; break; fi
 sleep 1
done
if [[ "$ready" != true ]]; then docker logs rr-billing-ci-pg; exit 1; fi
# No provider network and no inherited host credentials in the test container.
docker run --rm --platform linux/amd64 --network none \
 -v "$PWD:/work" -w /work -v rr-billing-ci-socket:/tmp/rr-retention-final-socket \
 "$PY_IMAGE" .ci-venv/bin/python scripts/ci/billing_tests.py
