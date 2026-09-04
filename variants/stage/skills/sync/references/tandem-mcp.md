# Working with the Tandem MCP

Read this once per session before the first Tandem call. It is the contract every Tandem skill relies on.

## Vocabulary

- **Project** is the customer engagement Tandem runs (phases, then tasks). The API calls it `implementation`: `implementation_id` and `implementation_query` mean the project. Always say "project" to the user.
- **Brief** is the ready-made status digest of a project. **Activity** is its chronological feed (tasks, conversations, knowledge changes). **Sources** are the connected tools attached to a project (Slack channels, mailboxes, call recorders, trackers, documents).
- Say "project knowledge" or "project context", never "brain", "facts" or "readiness".

## Two tools, one door

The server exposes exactly two tools; every Tandem capability is reached through them.

1. `search_capabilities` `{ query, limit?, account_query? | account_id? }` — describe the job in plain words ("read the project brief", "log time on a project"). Each result is a capability with its `id`, `description`, `usage` and its full call contract (`inputs`, `returns`). Results are candidates: pick the smallest job that exactly fits. If none fits, do the safe part in prose and give the user manual steps; never substitute an adjacent capability.
2. `execute_capability` `{ capabilityId, args }` — run it with the exact id and only the args its contract declares.

Search once per job, then execute. Reuse a contract you already fetched in this session rather than searching again. Read the capability's `usage` before calling: it carries the rules that matter (which fields exclude each other, what to do on ambiguity).

## Accounts

Tokens are user-scoped. With a single account, omit account fields. With several, pass exactly one of `account_query` (a name) or `account_id` on `search_capabilities`. If the server answers with account choices, put them to the user and retry with the chosen `account_id`.

## Naming a project

Reads and writes take `implementation_id` **or** `implementation_query` (project or company name), never both. Use the id once a read in this session returned it. An `ambiguous` result lists candidates: ask the user which one, then retry with its id. Never guess.

## Results and failures

- Results carry structured data and, for most reads, a `markdown` field written for surfaces without cards. Use the structured data to decide, the markdown to quote.
- `input_required`, `ambiguous`, `connection_required` come back with structured choices: put them to the user and retry with the chosen value in the named field only. Never fake a decision by changing other args.
- `invalid_input` names the fields at fault: fix those from the contract and retry once.
- A `connection_required` on an external action (Slack, Gmail, Calendar, HubSpot, Notion, Drive, Teams) means that tool is not connected on the account; say so and offer the setup skill. Do not retry.
- Never repeat a write whose outcome is uncertain. Read first.

## Writes

A write runs as soon as the client (or the user) approves the call. Before any write, state in one sentence what will change and wait for the user's go, except when the user already asked for exactly that change in this turn. Destructive writes (delete, archive, revoke) always get an explicit confirmation.

Writes that change account access (inviting a member) may ask for a six-digit code emailed to the user: ask the user for the code and pass it back in the field the failure names.

## No cards here

Several capability `usage` texts mention cards (`mode:'shown'`, "the card collects…"). Cards exist only inside the Tandem app. In this MCP session there are none, so:

- Present choices in prose (numbered lists) and pass the user's answer back yourself.
- To attach sources to a project, call `list_integrations` with `include_attach_scope: true`, present `attachable` and each source's `scope_choices` as a list, and pass the resulting `integrations` array to `create_project` or `update_project`.
- `connect_integration` cannot connect anything from here. It only returns what could be connected (`providers[]` with `integration_key`, `already_connected`, `account.slug`). Send the user to the app's Integrations page to authorize (see "Links to the app").

## Workspace mapping (`.tandem.json`)

A workspace (repository or folder) can be linked to a project with a `.tandem.json` file at its root:

```json
{
  "project": "ACME – HubSpot migration",
  "implementation_id": 123,
  "account": "Tandem",
  "sync": "ask",
  "last_sync": "2026-09-04T09:12:00Z"
}
```

- `sync`: `ask` (propose a sync at the end of a session), `auto` (a Stop hook asks the assistant to sync before ending, on clients with hooks), `off`.
- `last_sync`: ISO timestamp written by the sync skill.

Look for it (cwd, then parents up to the git root) before asking the user which project they mean. Create or edit it only with the user's agreement.

## Links to the app

Never compose an app hostname yourself: the same skill runs against production, stage and local servers.

1. Every read that names a project or a task returns `coordinates.url` (project page, task page). Use it verbatim.
2. `connect_integration` returns `integrations_url` per provider when the server provides it. Use it verbatim.
3. Otherwise take the app base URL from the server's `instructions` received at connection time (the line starting with `App:`), and build `<app>/<account.slug>/integrations?integration=<integration_key>` or `<app>/<account.slug>/projects/<implementation_id>`.
4. If none of these is available, ask the user for the address they use to open Tandem and build the link from it.
