#!/usr/bin/env bash
# Stop hook. When the workspace mapping says sync=auto and this session has not been synced since it
# started, ask Claude to run the tandem sync skill before stopping. Never loops: honours stop_hook_active.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT="$(cat 2>/dev/null || true)"
python3 - "$DIR" "$INPUT" <<'PY' 2>/dev/null || exit 0
import json, os, subprocess, sys
d = json.loads(sys.argv[2] or "{}")
if d.get("stop_hook_active"):
    sys.exit(0)
cwd = d.get("cwd") or os.getcwd()
sid = d.get("session_id") or ""
m = json.loads(subprocess.check_output(["python3", os.path.join(sys.argv[1], "tandem-mapping.py"), cwd], text=True))
if not m.get("found") or (m["mapping"] or {}).get("sync") != "auto":
    sys.exit(0)
start_file = os.path.join(os.environ.get("TMPDIR", "/tmp"), f"tandem-session-{sid}.start")
try:
    start = open(start_file).read().strip()
except Exception:
    sys.exit(0)
last = (m["mapping"] or {}).get("last_sync") or ""
if last >= start:
    sys.exit(0)
print(json.dumps({
    "decision": "block",
    "reason": "This workspace asks for automatic Tandem sync and this session has not been recorded yet. Run the tandem sync skill now (record the session into the project, then set last_sync in .tandem.json), then stop."
}))
PY
exit 0
