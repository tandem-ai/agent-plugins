---
name: sync
description: Save the current work session into its Tandem project as a document the team can read and the Tandem copilot can search — decisions, deliverables, assumptions, open questions — then, if the user wants, propose task updates and log time. Use when the user asks to sync, save or record the session to Tandem, or at the end of a work session on a client project.
---

# Sync the session into Tandem

The session becomes a document on the project: a teammate reads it in the app like a call recap, and the Tandem copilot retrieves it when someone asks what was decided or delivered. Nothing runs on its own: the user asks for the sync, reviews the document, and decides what else to write.

Read `references/tandem-mcp.md` first. The document format is `references/session-record.md`.

## 1. Split by customer, then summarise

You are the assistant that ran this session, so you hold the whole conversation. First decide how many projects it touched. The unit is the **customer**: a session that moved from one customer's work to another's is two records. One customer's work across several repositories, tools or tickets is one record. Internal work with no customer goes on the project the user names for it. One record is the common case; split only when the conversation plainly changed customer.

Then summarise each record directly, from your own context, into the format of `references/session-record.md`: what the user set out to do, what was done, decisions and why, deliverables (files, PRs, configurations, documents, by name), assumptions not validated with the customer, open questions, next steps. Write it for a teammate who was not there: facts, past tense, complete sentences.

Keep out: transcript excerpts, code, file contents, command output, stack traces, secrets (tokens, keys, passwords, connection strings, `.env` values), and any personal data beyond the names the project already knows. Under 15,000 characters per record; a long session gets a tighter summary, never a second record for the same customer.

Done when every record is written and each would stand on its own.

## 2. Resolve the projects and confirm

For each record, resolve its project with `list_projects` (`q` = the customer or project name the conversation used). Ask only for a record whose project the conversation never named; with several accounts, let the server's account choices settle the account first.

Show the user, in one message: each record with the project it will land in, and your estimate of the duration from the conversation's timestamps, stated as numbers to confirm ("about 2h10 by the timestamps: 1h30 on Acme, 40 min on Globex, correct?"). A pause with no activity is not work: leave it out and say so when it is large. The user may merge two records, drop one, move one to another project, or correct a duration. Wait for their edits or their go. Done when every record, its project and its duration are approved.

## 3. Create the document

Search "write a document into a project" once, then execute `create_document` for each approved record with:

- `implementation_id`
- `title`: `Work session — <YYYY-MM-DD> — <topic in five words or fewer>` (the topic comes from the summary, e.g. `HubSpot field mapping`)
- `body`: the approved document, markdown, verbatim

The body becomes a real project document: stored, indexed, readable in the app, and searchable by the Tandem copilot through project document search. Done when the result carries `created: true` and a `document_id`.

An `in_doubt` failure means the write threw on Tandem's side: read `list_documents` for the project; when the title is absent, retry once, and if it fails again say the server refused the write and stop the document step there. Never a third attempt.

## 4. Log the time

Propose one `log_time_entries` call carrying one entry per project with its approved duration and a one-line `note` (that document's topic), or one per task when a project's work touched several; `date` today, `billable` default unless said otherwise. Write it on the user's yes. Entries land unsynced in the timesheet for review.

## 5. Offer task updates

For each project, read its open tasks with `list_project_tasks` and compare them with its record. Propose, as a short list, the changes the session justifies: a task to mark `in_progress`, `blocked` or `done` with a completion note, a follow-up task for an open question that belongs in the plan. If the server offers a capability named `propose_task_changes` (search "propose task changes from an ingested record"), prefer its rows.

Ask which to apply. Write the accepted ones in one `update_tasks` call (all patches in `updates`) and one `create_tasks` call for new tasks. Skip entirely if the user declines. Done when the user has answered and the confirmed writes have returned.

## 6. Report

Four lines per project: the document (title, link to the project when a result carried one), the task changes written, the time logged, and what to check in the app.
