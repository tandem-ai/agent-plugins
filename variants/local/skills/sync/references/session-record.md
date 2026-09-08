# Session document — what it carries

The `body` of `create_document`, in markdown. The title is set separately: `Work session — <YYYY-MM-DD> — <topic>`.

There is no template. Shape the document the way this session reads best: a debugging session is a narrative of what was tried and what was found; a design session is the decisions and their reasons; a delivery session is the list of what shipped. Headings, bullets or prose are yours to choose, and a section that would be empty is not written.

Whatever the shape, a teammate who was not there must be able to find, without reading twice:

- **The situation**: which customer or project, what the user set out to do, in which assistant, roughly how long. One or two sentences, first.
- **What was done and what came out of it**, with the outcome of each piece, not the activity.
- **Decisions and why**, including who was involved or which earlier conversation they follow.
- **What was delivered**, by name: PRs, files, configurations, documents.
- **What was assumed without the customer's confirmation**, and who should confirm.
- **Open questions**, and for whom.
- **Next steps**, with owner and date when known.

Keep the details that matter to the work: a root cause, a rejected option and the reason, a number that changes a plan, a name the customer used. Drop what only the transcript needed: the order of tool calls, retries, dead ends that taught nothing.

Facts, past tense, complete sentences. No code, no transcript, no secrets.
