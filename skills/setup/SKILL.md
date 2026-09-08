---
name: setup
description: Onboard a user into Tandem from the assistant, up to a first live project with the sources they choose — project first, then guided source connections and attach, then the reading.
disable-model-invocation: true
---

# Set up Tandem, up to a first project

For a user who just installed the plugin. The account already exists and the MCP's OAuth identified them. The run mirrors the Tandem app's own first run: one project for one customer, then the tools that work happens in, then the reading. Nothing else to fill in.

Read `references/tandem-mcp.md` first. Provider recipes are in `references/providers.md`.

The whole run in one breath: project → sources → reading. Every step below serves that order; a question the order does not need is homework, and the sources answer it better.

## 1. Check the connection

Call `search_capabilities` with `query: "list projects"`. An authentication error means the Tandem connector is not signed in: say how to connect on this client (Claude Code: `/mcp` → tandem → authenticate; Claude.ai and Desktop: Customize → Connectors → Tandem → Connect; Codex: `codex mcp login tandem`; Cursor and others: the MCP settings page) and stop. When several accounts come back, ask which one and keep its `account_id` for the session.

Done when a search returns capabilities.

## 2. Say what Tandem does, then ask for the project

Two lines, then one question, in this order:

> Tandem gathers what your team knows about each customer, from calls, Slack, email and tickets, into one place. Then it works from that context: creates tasks, flags risks and delays, and writes briefs for you and your customer. You approve each move.
>
> **Which project are you working on, and which client is it for?** E.g. Rippling onboarding for Acme.

Read the answer as a sentence, never as a shape: "I'm onboarding ATQ on Rippling" carries project and customer both. Take the name as typed, casing and words included. When one of the two is missing, ask for that one alone. Skip anything the answer already says.

Ask for nothing else: no description, no goal, no timeline, no stakeholders, no playbook, no tracker. The sources answer those.

Done when you hold a project name and a customer name.

## 3. Create the project, empty

Say "Setting it up right now", then one `create_project` call:

```
create_project { name: <project>, company_query: <customer>, integrations: [] }
```

`company_query` creates the company when none of that name exists, in the same approved change: never call `create_company` first. `integrations` is the empty list, not omitted. No `playbook_id`, no import.

If the user volunteers that the plan already lives in a tracker (Asana, Jira, Linear, Rocketlane, a sheet, a Notion database), the project is an import instead: `list_tracker_projects`, let them pick the container, `import_tracker_project` with the returned `config`, `provider` and name. Their sentence is the only trigger; never ask.

Done when the result carries `created: true` and an `implementation_id`. Keep the id; every later call uses it.

## 4. Sources: connect to the account, attach to the project

Ask: "Which tools do you use with <customer>?" Accept the answer in their words (Slack, email, Teams, calls, a CRM, GitHub) and map it with the table in `references/providers.md`.

Call `connect_integration` once to learn `account.slug`, each provider's `integration_key` and `already_connected`. Then `list_integrations` with `include_attach_scope: true` for what is attachable now and its `scope_choices`.

Connecting and attaching are two halves. A provider is **connected** to the account by an authorization or a key; a source is **attached** to the project with its scope, and only attached sources are read. Treat the step as done only when both halves hold for every provider named.

For each provider the user named, one at a time:

1. **Already connected**: skip to attaching.
2. **Not connected**: give the recipe from `references/providers.md` (its walkthroughs for HubSpot, Slack, Teams, GitHub, Google and documents, step by step), verbatim for the API-key ones: the exact page where the key is created, the plan it needs, the scope to pick. Then send the provider's Integrations link (`integrations_url` from `connect_integration`, or built per `references/tandem-mcp.md` → Links to the app) and say the authorization or key goes there, never in this chat. When the user says it is done, call `list_integrations` again and confirm the provider now appears in `connections`. If not, say what to check and move to the next provider.
3. **Attach**: present the source's `scope_choices` as a numbered list (which Slack channels, which repository, which deal); domain-filtered sources (Gmail, Calendar, call recorders) need no question, the customer's domain is applied. A Gmail or Calendar connection is labelled with a teammate's own address when someone else connected it: say whose mailbox it is and let the user choose it or connect their own. A public Slack channel with `is_member: false` needs `join_slack_channel` first; a private one needs a member to run `/invite @Tandem`.

Then one `update_project` with the whole `integrations` array, every connected source in it, passed as `list_integrations` shaped it. A provider that did not connect is left out and named.

The user may skip any provider; everything remains addable later. Done when every provider named is attached or explicitly skipped, and `update_project` has returned.

## 5. The reading, and stop

Say, in one line, which sources landed on which project. Then:

> That is your setup done. Everything you pointed me at is being read into your workspace right now, and it carries on without you. The moment it lands, Tandem starts surfacing what matters on this project: what moved, what is blocked, what someone promised and by when. You will get an email as soon as it is ready.

Give the project link from `coordinates.url`. That is the end of the run: no automation offer, no next step invented.

From here on, answer whatever they ask about the project they just set up, naming their project, their customer and their sources. If they ask for something standing ("a weekly recap"), say whether Tandem can do it and set it up when they want it, behind its confirmation. At the end of a work session, `sync` records it into the project.
