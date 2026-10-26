"""Bounded raw diagnostics, owner-only and intentionally not exposed by HTTP."""
import os
import threading
from studio.storage import open_directory

LIMIT = 131072


def retain(store, job_id, data):
    with open_directory(store.scoped_directory('jobs', job_id)) as directory:
        fd = os.open('diagnostics.log', os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600, dir_fd=directory)
        with os.fdopen(fd, 'r+b') as log:
            os.fchmod(log.fileno(), 0o600)
            old = log.read(LIMIT)
            log.seek(0)
            log.write((old + data)[-LIMIT:])
            log.truncate()


class ChildDiagnostics:
    def __init__(self, stream):
        self.tail = bytearray()
        self.stop = threading.Event()
        self.stream = stream
        self.thread = threading.Thread(target=self._read, daemon=True)
        self.thread.start()

    def _read(self):
        try:
            fd = self.stream.fileno()
            if not isinstance(fd, int):
                return  # Injectable command runners need not provide an OS pipe.
            os.set_blocking(fd, False)
            final_bytes = 0
            while True:
                try:
                    block = os.read(fd, 8192)
                except BlockingIOError:
                    if self.stop.is_set():
                        break
                    self.stop.wait(.05)
                    continue
                if not block:
                    break
                self.tail.extend(block)
                del self.tail[:-LIMIT]
                if self.stop.is_set():
                    # Drain bounded pending output, not an infinite descendant.
                    final_bytes += len(block)
                    if final_bytes >= LIMIT:
                        break
        except (OSError, ValueError):
            pass
        finally:
            self.stream.close()

    def finish(self):
        self.stop.set()
        self.thread.join()
        return bytes(self.tail)
