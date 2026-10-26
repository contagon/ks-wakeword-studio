#!/usr/bin/env python3
"""Print the pip-installed cuBLAS/cuDNN library directories of this interpreter.

Callers prepend the result to LD_LIBRARY_PATH; CTranslate2 and TensorFlow load
these libraries before Python can adjust the search path itself.
"""
from importlib.util import find_spec
from pathlib import Path


def package_directory(name):
    try:
        spec = find_spec(name)
    except (ImportError, AttributeError, ValueError):
        return ""
    if spec is None:
        return ""
    for location in spec.submodule_search_locations or ():
        if location:
            return str(Path(location).resolve())
    origin = spec.origin
    if origin and origin not in {"built-in", "frozen"}:
        return str(Path(origin).resolve().parent)
    return ""


if __name__ == "__main__":
    paths = [package_directory("nvidia.cublas.lib"), package_directory("nvidia.cudnn.lib")]
    print(":".join(dict.fromkeys(path for path in paths if path)))
