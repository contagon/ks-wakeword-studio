"""Point the import-time server setup at throwaway data instead of /data."""
import atexit
import os
import shutil
import tempfile

if "DATA_DIR" not in os.environ:
    os.environ["DATA_DIR"] = tempfile.mkdtemp(prefix="mww-test-")
    atexit.register(shutil.rmtree, os.environ["DATA_DIR"], ignore_errors=True)
