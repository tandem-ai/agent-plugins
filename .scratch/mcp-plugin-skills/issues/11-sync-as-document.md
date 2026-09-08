# Sync writes a project document, summarised by the host assistant
Type: grilling
Status: resolved

## Question

How should `sync` capture a session and where should it land so the team and the copilot can use it?

## Answer

Decided 2026-09-08. The assistant running the session summarises it itself, from its own context, into the markdown format in `skills/sync/references/session-record.md` — no notes kept by a prior skill, no reconstruction protocol of ours. The user reviews it. It is written with `create_document` (title `Work session — <date> — <topic>`, body ≤ 20,000 chars), which stores it as a real project document, ingests and indexes it (PFB-447 document system), so the Tandem copilot retrieves it through `search_project_documents` / `read_project_document`. `add_context` stays for notes and pasted transcripts. Task updates and time are offered afterwards, never written unasked. No server change needed.
