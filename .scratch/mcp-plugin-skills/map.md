# Map — Tandem plugin skills (start, sync, setup)

Label: wayfinder:map · Tracker: local markdown (`.scratch/`) · Opened 2026-09-04

## Destination

Two skills shipped in this plugin — `sync` and `setup` — that a FDE can run from any supported assistant against the production Tandem MCP, with every open product decision behind them settled, and a v1 tag published to the team's own marketplace.

## Notes

- Domain: Tandem customer projects (implementation = project), the capability catalogue in `platform/api/src/app/agent/tools/native/*.ts`, the MCP door `search_capabilities` + `execute_capability`.
- This effort carries execution: the first draft of the skills is written in `skills/` so decisions have something concrete to react to. Tickets refine or reverse them; they do not start from a blank page.
- Skills: `writing-for-agents` (platform repo) for every SKILL.md edit; `/grilling` and `/domain-modeling` for grilling tickets; `/research` for research tickets.
- Standing preferences: nothing replaces an existing capability; additions sit beside the catalogue. Skills stay in English. User-facing wording says "project", never "brain".

## Decisions so far

- [Catalogue coverage per skill](issues/00-catalogue-coverage.md) — every step of the three skills maps to an existing capability except the source-connection link (setup step 3) and the session-dedicated ingestion (sync v2).
- [Per-platform packaging](issues/00-platform-packaging.md) — one repo, `skills/` as source, one manifest per platform, `.agents/skills/` generated.
- [Sync writes a project document](issues/11-sync-as-document.md) — the host assistant summarises its own session; `create_document` stores it as a real, indexed project document the copilot retrieves; no `.tandem.json`, no hooks, no `start`.
- [No hooks, no start skill](issues/02-sync-trigger-policy.md) — Tandem does not drive how people work in their assistant: nothing runs unasked, and the plugin does not prescribe how a session begins.

## Not yet specified

- Skills served by the MCP itself (`list_skills` / `get_skill`, team playbooks rendered as skills) and MCP prompts as slash commands: shape, which skills move server-side, how the plugin references them.
- How `sync` splits time per task when the record touches several tasks: from the notes, from timestamps, or always asked.
- Proactive nudges outside a session (a customer message unanswered for two days) — probably a Tandem agent, not a skill.

## Out of scope

- Lifecycle hooks and a `start` skill — ruled out 2026-09-08: the plugin must not force behaviour or prescribe how a session begins. Tickets 02, 05, 06 and 10 closed on that decision.

- Desktop companion app and `tandem` CLI — separate effort, see the platform exploration doc `docs/active/2026-09-03-mcp-experience-proposal.html`.
- Listings in third-party directories beyond the checklist in README — a distribution effort once v1 is stable.
