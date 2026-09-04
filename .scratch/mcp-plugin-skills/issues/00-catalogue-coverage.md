# Catalogue coverage per skill
Type: research
Status: resolved

## Question

For each step of `start`, `sync` and `setup`, which existing Tandem capability serves it, and where does the catalogue fall short?

## Answer

Read from `platform/api/src/app/agent/tools/native/*.ts` on 2026-09-04 (main).

start: `list_projects`, `get_my_day`, `get_brief`, `list_project_tasks`, `get_activity` (since/until/provider, limit ≤ 50), `list_divergences`, `calendar.find_events`, `get_task`, `list_documents`, `get_conversation` (paged by `next_offset`), `update_tasks` (one call, `updates[]`), `add_note` (task coordinates). No gap.

sync: `add_context` (content ≤ 50,000 chars, `register` speech|written, `happened_on`, `origin` ≤ 60 chars, dedup by content hash, may return `input_required`), `update_tasks`, `create_tasks`, `add_note`, `log_time_entries` (`entries[]` with duration_minutes, date, note, billable, member). `propose_task_changes` exists on branch PFB-480 (Paul, 2026-09-02), not on main: the skill uses it when the server offers it. Gap: no session-dedicated ingestion (kind, typing, dedup by session, higher cap) — fog.

setup: `connect_integration` returns providers + `integration_key` + `account.slug` but connects nothing outside the app card; `list_integrations` (`include_attach_scope`), `join_slack_channel`, `list_tracker_projects` → `import_tracker_project`, `list_playbooks`, `create_project` (`company_query` creates the company in the same change), `update_project` (`integrations` replaces the set), `invite_member` (step-up code), `add_context`, `get_brief`. Gap: a capability that returns a time-limited Nango connect link (ticket 04). Interim: deep link `https://app.usetandem.ai/<slug>/integrations?integration=<integration_key>` — the route accepts the `integration` search param (focus), nothing produces it in-app yet.

MCP surface facts that shape every skill: two tools only; `account_query|account_id` on search; failures `input_required|ambiguous|connection_required|invalid_input` with structured choices; no cards, results carry `markdown`; writes run on client approval; `tools.listChanged` withdrawn (PFB-178), so a renamed capability needs a client restart to appear.
