# Agent guide — tandem-ai/agent-plugins

This repository ships the Tandem plugin for AI assistants: one MCP connector (`.mcp.json` and its per-platform twins) and the two skills in `skills/`. No hooks, no background behaviour: a skill runs when the user asks and every write is confirmed in the user's assistant.

- Skills are the product. Edit `skills/<name>/SKILL.md` and that skill's own files under `references/`. `references/tandem-mcp.md` inside each skill is generated from `reference/tandem-mcp.md`; edit the source, then run `npm run build`.
- `.agents/skills/` is generated. Never edit it by hand.
- Every manifest carries the same version; `npm run build` refuses a mismatch. Bump all of them together.
- A skill talks to Tandem only through `search_capabilities` and `execute_capability`. It names Tandem capabilities by their id (for example `get_brief`, `add_context`) and reads each capability's `usage` before calling it. It never assumes a card exists.
- User-facing words: "project", never "implementation"; "project knowledge" or "context", never "brain", "facts" or "readiness".
- Writing rules for skills follow the `writing-for-agents` skill of the Tandem platform repository: steps with completion criteria, reference material disclosed behind a file, positive phrasing, no duplication.
- Verify a change by running `npm run check`, then by reading the skill once as the assistant would, step by step, against the capability contracts in the platform repository (`api/src/app/agent/tools/native/*.ts`).
- Open decisions live in `.scratch/mcp-plugin-skills/` (wayfinder map, local markdown tracker).
