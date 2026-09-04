#!/usr/bin/env python3
"""Read the workspace's Tandem mapping (.tandem.json) from cwd or the git root.

Prints JSON: {"found": bool, "path": str|null, "mapping": {...}|null}.
Never fails: any error prints {"found": false}.
"""
import json, os, subprocess, sys

def find(start):
    cur = os.path.abspath(start)
    while True:
        p = os.path.join(cur, ".tandem.json")
        if os.path.isfile(p):
            return p
        parent = os.path.dirname(cur)
        if parent == cur:
            return None
        cur = parent

def main():
    cwd = sys.argv[1] if len(sys.argv) > 1 else os.getcwd()
    path = find(cwd)
    if not path:
        try:
            root = subprocess.check_output(["git", "-C", cwd, "rev-parse", "--show-toplevel"], stderr=subprocess.DEVNULL, text=True).strip()
            path = find(root)
        except Exception:
            path = None
    if not path:
        print(json.dumps({"found": False, "path": None, "mapping": None})); return
    try:
        with open(path) as f:
            mapping = json.load(f)
    except Exception:
        print(json.dumps({"found": False, "path": path, "mapping": None})); return
    print(json.dumps({"found": True, "path": path, "mapping": mapping}))

if __name__ == "__main__":
    try:
        main()
    except Exception:
        print(json.dumps({"found": False, "path": None, "mapping": None}))
