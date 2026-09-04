# Map — Tandem plugin skills (start, sync, setup)

Label: wayfinder:map · Tracker: local markdown (`.scratch/`) · Opened 2026-09-04

## Destination

Three skills shipped in this plugin — `start`, `sync`, `setup` — that a FDE can run from any supported assistant against the production Tandem MCP, with every open product decision behind them settled, and a v1 tag published to the team's own marketplace.

## Notes

- Domain: Tandem customer projects (implementation = project), the capability catalogue in `platform/api/src/app/agent/tools/native/*.ts`, the MCP door `search_capabilities` + `execute_capability`.
- This effort carries execution: the first draft of the three skills is written in `skills/` so decisions have something concrete to react to. Tickets refine or reverse them; they do not start from a blank page.
- Skills: `writing-for-agents` (platform repo) for every SKILL.md edit; `/grilling` and `/domain-modeling` for grilling tickets; `/research` for research tickets.
- Standing preferences: nothing replaces an existing capability; additions sit beside the catalogue. Skills stay in English. User-facing wording says "project", never "brain".

## Decisions so far

- [Catalogue coverage per skill](issues/00-catalogue-coverage.md) — every step of the three skills maps to an existing capability except the source-connection link (setup step 3) and the session-dedicated ingestion (sync v2).
- [Per-platform packaging](issues/00-platform-packaging.md) — one repo, `skills/` as source, one manifest per platform, `.agents/skills/` generated; hooks shipped for Claude Code only in v1.

## Not yet specified

- Skills served by the MCP itself (`list_skills` / `get_skill`, team playbooks rendered as skills) and MCP prompts as slash commands: shape, which skills move server-side, how the plugin references them.
- A session-dedicated ingestion capability (`agent_session` kind, typed fields, dedup by session, cap) and its automatic chaining to task proposals and time.
- How `sync` splits time per task when the record touches several tasks: from the notes, from timestamps, or always asked.
- What `start` shows when a project has no plan (headless project read from a Notion database or a tracker container).
- Proactive nudges outside a session (a customer message unanswered for two days) — probably a Tandem agent, not a skill.

## Out of scope

- Desktop companion app and `tandem` CLI — separate effort, see the platform exploration doc `docs/active/2026-09-03-mcp-experience-proposal.html`.
- Listings in third-party directories beyond the checklist in README — a distribution effort once v1 is stable.
