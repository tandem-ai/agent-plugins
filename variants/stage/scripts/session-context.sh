#!/usr/bin/env bash
# SessionStart hook. Stdout is added to the model's context.
# Announces the Tandem project linked to this workspace (.tandem.json) and records the session start
# so the Stop guard can tell whether this session was synced.
set -u
DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT="$(cat 2>/dev/null || true)"
CWD="$(printf '%s' "$INPUT" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("cwd",""))' 2>/dev/null || true)"
SID="$(printf '%s' "$INPUT" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("session_id",""))' 2>/dev/null || true)"
[ -z "$CWD" ] && CWD="$PWD"
MAP="$(python3 "$DIR/tandem-mapping.py" "$CWD" 2>/dev/null || echo '{"found":false}')"
FOUND="$(printf '%s' "$MAP" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("found"))' 2>/dev/null || echo False)"
if [ -n "$SID" ]; then
  date -u +%Y-%m-%dT%H:%M:%SZ > "${TMPDIR:-/tmp}/tandem-session-${SID}.start" 2>/dev/null || true
fi
if [ "$FOUND" = "True" ]; then
  printf '%s' "$MAP" | python3 -c '
import json,sys
m=json.load(sys.stdin)["mapping"]
name=m.get("project") or "unknown project"; pid=m.get("implementation_id"); acct=m.get("account"); mode=m.get("sync","ask")
line=f"Tandem: this workspace is linked to the project \"{name}\""
if pid: line+=f" (implementation_id {pid})"
if acct: line+=f" on account \"{acct}\""
line+=f". Session sync mode: {mode}. Before working on the project, run the tandem start skill to load where it stands; before ending, run the tandem sync skill to record the session."
print(line)'
fi
exit 0
