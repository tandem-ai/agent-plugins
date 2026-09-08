---
name: setup
description: Onboard a user into Tandem from the assistant, up to a first live project with the sources they choose — guided source connections, project creation, first brief, workspace link.
disable-model-invocation: true
---

# Set up Tandem, up to a first project

For a user who just installed the plugin, whether they are new to Tandem or not. The MCP's OAuth already identified them. The goal is a first project that lives: the customer, the plan, the sources the user chose, a first brief. Then the user knows how to bring the next session back into it with `sync`.

Read `references/tandem-mcp.md` first. Provider guidance is in `references/providers.md`.

## 1. Check the connection

Call `search_capabilities` with `query: "list projects"`. An authentication error means the Tandem connector is not signed in: say how to connect on this client (Claude Code: `/mcp` → tandem → authenticate; Claude.ai and Desktop: Customize → Connectors → Tandem → Connect; Codex: `codex mcp login tandem`; Cursor and others: the MCP settings page) and stop. When several accounts come back, ask which one and keep its `account_id` for the session.

Done when a search returns capabilities.

## 2. Start from the customer, not the tools

Ask, in one message and in the user's words, what they are working on: which customer, where the exchanges with them happen (Slack, email, Teams), where calls are recorded, where the plan lives (Tandem, Asana, Jira, Linear, Rocketlane, a sheet, a Notion database), where documents live (Drive, Notion). Accept partial answers. Done when you can name the customer and at least one place where the work happens.

## 3. Connect only what matters, guided

Map the answers to providers with `references/providers.md`. Call `connect_integration` once to learn `account.slug`, each provider's `integration_key` and `already_connected`. Skip what is already connected.

For each provider the user wants, one at a time:

1. Say why it helps for this customer, in one line ("decisions happen in Slack; connecting it lets Tandem follow them").
2. Give the recipe from `references/providers.md`: for OAuth tools, what they will authorize and who can (workspace admin, approval); for API-key tools, the exact page where the key is created, the plan it requires, the key type or scope to pick.
3. Send the provider's Integrations link (`integrations_url` from `connect_integration`, or built as described in `references/tandem-mcp.md` → Links to the app) and say the key or authorization is entered there, never in this chat.
4. When the user says it is done, call `list_integrations` and confirm the provider now appears in `connections`. If not, say what to check and offer to continue with the next one.

The user may skip any provider; everything remains addable later. Done when every chosen provider is connected or explicitly skipped.

## 4. Create the project

Decide the shape first:

- **The plan already lives in a tracker** (Asana, Jira, Linear, Rocketlane, a sheet, a Notion database): call `list_tracker_projects`, let the user pick the container, then `import_tracker_project` with the returned `config`, `provider` and name. This creates the project with its phases and tasks and keeps it synced.
- **Otherwise**: `create_project` with `company_query` set to the customer's name (an unknown name creates the company in the same approved change). Before it: call `list_playbooks` and present each playbook with its phase count; the user picks one or explicitly chooses to start empty. Then a project name (propose one). Then ask whether to attach sources.

To attach sources: `list_integrations` with `include_attach_scope: true`; present `attachable` and each source's `scope_choices` in prose (which Slack channels, which repository); pass the user's picks as the `integrations` array to `create_project` or `update_project`. A public Slack channel with `is_member: false` needs `join_slack_channel` first; a private one needs a member to run `/invite @Tandem`.

Optional, ask once: teammates to invite (`invite_member`, may require the emailed code), and any kick-off notes or statement of work the user wants to paste (`add_context`, content verbatim).

Done when the project exists and the user has answered the source and teammate questions.

## 5. First result

Call `get_brief` on the new project and show it. Say plainly that it fills in as the connected sources are read, and that the next `start` will show the difference.

## 6. Close

Three things to try next, in the user's words: "what changed on <customer> this week", "prepare my call with <stakeholder>", and, at the end of a work session, "sync this session to Tandem".
