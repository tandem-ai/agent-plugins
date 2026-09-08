# Hooks on Codex, Cursor, Gemini CLI, Antigravity, Copilot
Type: research
Status: resolved

## Question

Claude Code hooks are shipped (`hooks/hooks.json`, SessionStart + Stop). For each other client with hooks: the plugin/extension file that carries them, the event names for session start / stop / pre-compaction, the stdin payload fields (`cwd`, `session_id`, `transcript_path`), whether a hook can block a stop with a reason, and whether plugin hooks need user approval (Codex does). Deliver one hooks file per platform or a note on why not.

## Answer

Out of scope: the plugin ships no hooks on any client (decision of 2026-09-08).
