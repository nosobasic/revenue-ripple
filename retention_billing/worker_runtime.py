"""One supervisor, one spawned one-receipt child; hard deadline below lease TTL.

No daemonization, schema setup or credential discovery on import. The proposed
external supervisor must run one replica. flock prevents duplicates on one host.
"""
import argparse
import fcntl
import multiprocessing
import os
import signal
import threading
import time
from .runtime import ConfigurationError, read_settings, create_worker, build_dependencies

RESULTS = {'idle','recorded','duplicate','review','no_extension','unchanged','ignored','retry','dead','lease_lost'}


def _child(settings, worker_factory, output):
    try:
        result = worker_factory(settings).run_once()
        output.send(result if result in RESULTS else 'error')
    except Exception:
        output.send('error')
    finally:
        output.close()


def _reap(process):
    if process.is_alive():
        process.terminate()
        process.join(2)
    if process.is_alive():
        process.kill()
        process.join(2)
    if process.is_alive():
        raise RuntimeError('worker_teardown_failed')
    process.join()


def run_cycle(settings, stop, *, worker_factory=create_worker, lifetime=90):
    if not 0 < lifetime <= 90:
        raise ValueError('invalid_worker_lifetime')
    if stop.is_set():
        return 'stopped'
    context = multiprocessing.get_context('spawn')
    incoming, outgoing = context.Pipe(duplex=False)
    process = context.Process(target=_child, args=(settings, worker_factory, outgoing))
    started = time.monotonic()
    try:
        process.start()
        outgoing.close()
        while process.is_alive():
            if stop.is_set():
                return 'stopped'
            remaining = lifetime - (time.monotonic() - started)
            if remaining <= 0:
                return 'timeout'
            process.join(min(0.1, remaining))
        if process.exitcode != 0:
            return 'error'
        try:
            return incoming.recv() if incoming.poll() else 'error'
        except EOFError:
            return 'error'
    finally:
        if process.pid is not None:
            _reap(process)
            process.close()
        incoming.close()
        outgoing.close()


def run(settings, stop, *, lock_path='/tmp/rr-retention-worker.lock', max_cycles=None,
        worker_factory=create_worker, lifetime=90, report=print):
    if max_cycles is not None and max_cycles < 1:
        raise ValueError('invalid_cycle_limit')
    # Never unlink a held lock: another supervisor could otherwise lock a new inode.
    descriptor = os.open(lock_path, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    try:
        try:
            fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError('worker_already_running') from None
        count = 0
        while not stop.is_set() and (max_cycles is None or count < max_cycles):
            result = run_cycle(settings, stop, worker_factory=worker_factory, lifetime=lifetime)
            report('retention_worker:'+result)
            count += 1
            if max_cycles is not None and count >= max_cycles:
                break
            # Exceptions, provider retries and hard kills never become a hot loop.
            stop.wait(5 if result in {'error','timeout','retry'} else 1)
        return count
    finally:
        os.close(descriptor)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--max-cycles', type=int)
    args = parser.parse_args()
    stop = threading.Event()
    for sig in (signal.SIGTERM, signal.SIGINT):
        signal.signal(sig, lambda *_: stop.set())
    try:
        settings = read_settings()
        if settings is None:
            print('retention_worker:disabled')
            return 0
        build_dependencies(settings)  # Validate before spawning; no connections.
        run(settings, stop, max_cycles=args.max_cycles)
        return 0
    except (ConfigurationError, ValueError, RuntimeError, OSError):
        print('retention_worker:startup_or_supervision_failed')
        return 1


if __name__ == '__main__':
    raise SystemExit(main())
