#!/usr/bin/env bash
set -euo pipefail
image='postgres@sha256:2c0d947901cfeaee8121e4f2f60fc55a4d1d6835708a21c9c70fec8eaf3f3dcb'
cleanup() { docker rm -f rr-db15-proposal-test >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker pull --platform linux/amd64 "$image"
docker image inspect --format '{{.Id}} {{.Os}}/{{.Architecture}}' "$image"
docker run -d --name rr-db15-proposal-test --platform linux/amd64 --network none \
 --tmpfs /var/lib/postgresql/data -e POSTGRES_HOST_AUTH_METHOD=trust \
 "$image" postgres -c listen_addresses=''
ready=false
for i in $(seq 1 30); do
 if [[ "$(docker inspect -f '{{.State.Running}}' rr-db15-proposal-test)" != true ]]; then break; fi
 if docker logs rr-db15-proposal-test 2>&1 | grep -q 'PostgreSQL init process complete' && docker exec rr-db15-proposal-test pg_isready -U postgres; then ready=true; break; fi
 sleep 1
done
if [[ "$ready" != true ]]; then docker logs rr-db15-proposal-test; exit 1; fi
python3 tests/db15/test_proposal.py
