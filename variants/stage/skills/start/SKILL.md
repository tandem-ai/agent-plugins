---
name: start
description: Start a work session on a Tandem customer project — load where the project stands, what remains, what changed, then frame the chosen task and keep checking the work against what the customer validated. Use when the user opens a client repository linked to a Tandem project, asks what to work on for a client, names a project task to pick up, or runs /tandem:start.
---

# Start a work session on a project

Tandem already knows the plan, what is done, what remains, and what the customer said. This skill uses that knowledge to move the project forward in a guided conversation, and keeps the work honest against it while you go. It never rediscovers the project from scratch.

Read `references/tandem-mcp.md` first (two tools, naming, failures, no cards).

Keep **session notes** from the first step on: decisions taken, assumptions not validated with the customer, what was delivered (files, PRs, configs), open questions for the customer, tasks touched, start time. The `sync` skill turns them into the session record.

## 1. Resolve the project

Order: the project named in the command → `.tandem.json` in the workspace → ask. When asking, search `list_projects` with the name the user gives; if they do not know, read `get_my_day` and show the projects behind their most urgent open tasks. Done when you hold one `implementation_id` and its name.

## 2. Load where the project stands

Fetch these reads (search once each, execute in parallel where the client allows):

- `get_brief` — headline, blockers, risks worth watching, recent changes, meetings, next steps.
- `list_project_tasks` — open tasks (statuses `to_do`, `in_progress`, `blocked`, `regressed`), with their phase, due date and assignee. Page if `has_more`.
- `get_activity` — `since` = `last_sync` from `.tandem.json`, else seven days ago. This is "what changed since you last worked here".
- `list_divergences` — what later conversations established that differs from the source-of-truth documents.
- `calendar.find_events` for the next seven days, when Calendar is connected. On `connection_required`, skip silently.

Done when every read has returned or been skipped for a reason you can name.

## 3. Open: the remaining work, ordered

Present, in this order and in prose:

1. **What remains** in the current phase: tasks with due dates, nearest first; then the next phase in one line.
2. **What blocks**, and why, from the brief and blocked tasks.
3. **What changed** since the last session: decisions in calls, customer messages, tasks moved by colleagues, knowledge changes. Cite the source event (call of the 12th, thread in #acme-migration).
4. **What is expected before the next milestone or meeting**.

Then propose where to begin, with the reason (blocking for the call on Thursday; due tomorrow; a customer message waits on it), and ask. Done when the user has chosen a task or said what they want to do instead.

## 4. Frame the task

For the chosen task:

- `get_task` — description, delivery guidance, recent activity, tracker comments.
- `list_documents` — read the document marked source of truth when the task has one; open it through its link if the user wants the detail.
- From step 2's activity, pick the conversations that mention this task and read them with `get_conversation` (page with `next_offset` until done). Quote exact wording where a decision was made.
- On Claude Code and Cowork, delegate this reading to a sub-agent when there are more than three conversations, and continue framing meanwhile.

Restate in three parts: **what was validated with the customer** (with the source), **what is still ambiguous**, **what you propose to do**. Wait for the user to adjust and confirm. Done when the user has said go.

## 5. Work, with continuous checks

Do the work the user asked for. Before each substantive step (a design choice, a data shape, a scope decision, a deadline assumption), compare it with the decisions collected in step 4:

- A contradiction → say it plainly, with the source: "you are going for a daily sync; the customer asked for real time in the call of the 12th." Offer the two paths: follow what was validated, or record the change as an assumption to confirm with the customer.
- A gap → "this field is not in the validated spec"; propose to record it as an open question.
- A schedule fact → "this task is due Friday according to the plan."

Append every decision, assumption, delivered item and open question to the session notes as it happens. Done when the user says the work for this session is finished, or asks to stop.

## 6. Close

1. Summarise: what moved forward, what remains on the task, assumptions taken, open questions for the customer.
2. Propose task changes with `update_tasks` (status, completion note) and `add_note` for context the team should read later; confirm before writing.
3. Propose the `sync` skill to record the session into the project. If `.tandem.json` says `sync: auto`, run it without asking.
4. If a source the brief flags as missing would have helped (no Slack channel attached, no tracker), offer the `setup` skill's connection step.

Done when the user has answered the sync proposal.
