---
name: sync
description: Record the current work session into its Tandem project — a session record added to the project's context, task updates proposed and confirmed, time logged. Use at the end of a work session on a client project, before context compaction, when the user asks to sync or save the session to Tandem, when the start skill closes, or when a Stop hook asks for it.
---

# Sync the session into Tandem

The session becomes an item in the project's activity, visible to the team like a call or a Slack thread: "Gabriel, Claude Code, 2h10: HubSpot field mapping, decision X, open question Y." The project brief updates from it, task changes are proposed, time is logged.

Read `references/tandem-mcp.md` first. The record format is `references/session-record.md`.

## 1. Resolve the project and the notes

Project: the session notes kept by the `start` skill → `.tandem.json` in the workspace → ask. Notes: the running session notes when they exist; otherwise reconstruct them from this conversation. Duration: from the session start time in the notes or the SessionStart hook; otherwise ask ("about how long did this take?").

Done when you hold the `implementation_id`, the notes, and a duration in minutes.

## 2. Write the session record

Fill `references/session-record.md`. Rules that make it safe to share with the team and to send to a third-party service:

- Decisions, deliverables, assumptions, questions, tasks touched, duration. Nothing else.
- No transcript, no code, no file contents, no command output, no stack traces. Name files and PRs, do not paste them.
- No secrets. Scan for tokens, keys, passwords, connection strings, `.env` values, and remove them even when they look harmless.
- People: only names the project already knows (stakeholders, teammates). No personal data beyond that.
- Under 12,000 characters. A longer session gets a shorter record, not a split.
- Written, factual, past tense. The reader is a teammate who was not there.

Show the record to the user and wait for their edits or go. Exception: `.tandem.json` says `sync: auto` and the skill runs from a hook, in which case send it as written and say so in the final report.

Done when the user has approved the record, or auto mode applies.

## 3. Add it to the project

Search "add a note or pasted content to a project" and execute `add_context` with:

- `implementation_id`
- `content`: the record, verbatim
- `register`: `written`
- `happened_on`: today, `YYYY-MM-DD`
- `origin`: the client you are running in, e.g. `Claude Code session`, `Cursor session`

Answer `input_required` by passing only the field it names, keeping `content` unchanged. `already_present: true` means this exact record was sent before: stop here and say so.

Done when the result carries `added: true` and an `item_id`.

## 4. Propose task changes

For each task in the notes, propose one change: status (`in_progress`, `blocked`, `done`), a completion note, or a new follow-up task for an open question that belongs in the plan. If a capability named `propose_task_changes` exists on this server (search "propose task changes from an ingested record"), call it with the `item_id` from step 3 and present its rows instead of deriving them yourself.

Present the proposals as a list and ask which to apply. Apply in one `update_tasks` call (all patches in `updates`), one `create_tasks` call for new tasks, and `add_note` for context worth reading later. Done when the user has answered and the confirmed writes have returned.

## 5. Log the time

Propose `log_time_entries` with one entry for the project, or one entry per task when the session touched several ("1h30 mapping, 40 min acceptance tests"), each with a one-line `note`. `date` is today; `billable` stays default unless the user says otherwise. Ask before writing; skip if the user declines. Entries land unsynced in the timesheet for review.

Done when the entries are written or declined.

## 6. Finish

Update `.tandem.json` `last_sync` to now (ISO, UTC) when the file exists and the user allowed edits to it. Report in four lines: what was added to the project, which tasks changed, what time was logged, what the user should check in the app (link to the project when a result carried one).
