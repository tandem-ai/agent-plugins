---
name: sync
description: Save the current work session into its Tandem project as a document the team can read and the Tandem copilot can search — decisions, deliverables, assumptions, open questions — then, if the user wants, propose task updates and log time. Use when the user asks to sync, save or record the session to Tandem, or at the end of a work session on a client project.
---

# Sync the session into Tandem

The session becomes a document on the project: a teammate reads it in the app like a call recap, and the Tandem copilot retrieves it when someone asks what was decided or delivered. Nothing runs on its own: the user asks for the sync, reviews the document, and decides what else to write.

Read `references/tandem-mcp.md` first. The document format is `references/session-record.md`.

## 1. Summarise the session yourself

You are the assistant that ran this session, so you hold the whole conversation. Summarise it directly, from your own context, into the format of `references/session-record.md`: what the user set out to do, what was done, decisions and why, deliverables (files, PRs, configurations, documents, by name), assumptions not validated with the customer, open questions, next steps. Write it for a teammate who was not there: facts, past tense, complete sentences.

Keep out: transcript excerpts, code, file contents, command output, stack traces, secrets (tokens, keys, passwords, connection strings, `.env` values), and any personal data beyond the names the project already knows. Under 15,000 characters; a long session gets a tighter summary, never a split.

Done when the document is written and would stand on its own.

## 2. Resolve the project and confirm

If the conversation names the project or customer, resolve it with `list_projects` (`q` = that name). Otherwise ask the user which project this belongs to; with several accounts, let the server's account choices settle the account first.

Show the user the document and the project it will land in. Wait for their edits or their go. Done when both are approved.

## 3. Create the document

Search "write a document into a project" and execute `create_document` with:

- `implementation_id`
- `title`: `Work session — <YYYY-MM-DD> — <topic in five words or fewer>` (the topic comes from the summary, e.g. `HubSpot field mapping`)
- `body`: the approved document, markdown, verbatim

The body becomes a real project document: stored, indexed, readable in the app, and searchable by the Tandem copilot through project document search. Done when the result carries `created: true` and a `document_id`.

## 4. Offer task updates

Read the project's open tasks with `list_project_tasks` and compare them with the summary. Propose, as a short list, the changes the session justifies: a task to mark `in_progress`, `blocked` or `done` with a completion note, a follow-up task for an open question that belongs in the plan. If the server offers a capability named `propose_task_changes` (search "propose task changes from an ingested record"), prefer its rows.

Ask which to apply. Write the accepted ones in one `update_tasks` call (all patches in `updates`) and one `create_tasks` call for new tasks. Skip entirely if the user declines. Done when the user has answered and the confirmed writes have returned.

## 5. Offer to log the time

Ask whether to log the session's time: one entry on the project, or one per task when the session touched several, each with a one-line `note`; `date` today, `billable` default unless said otherwise. Write with `log_time_entries` only on a yes. Entries land unsynced in the timesheet for review.

## 6. Report

Four lines: the document (title, link to the project when a result carried one), the task changes written, the time logged, and what to check in the app.
