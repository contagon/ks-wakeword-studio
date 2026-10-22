#!/usr/bin/env python3
"""Owned manifest-mode training CLI; does not import the web server."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from studio.legacy_training import main

if __name__ == '__main__':
    raise SystemExit(main())
