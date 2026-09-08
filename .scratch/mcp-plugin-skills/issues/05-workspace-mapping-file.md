# Workspace ↔ project mapping
Type: grilling
Status: resolved

## Question

The draft uses `.tandem.json` at the repository root (project, implementation_id, account, sync, last_sync). Is a file in the customer's repository acceptable (it is committed unless ignored, and names the customer and our ids), or should the mapping live in the user's home (per git remote), in the plugin's data dir, or on the Tandem server (repo URL attached to the project)? Decide the location and what the file may contain.

## Answer

Dropped with the hooks and the `start` skill. `sync` resolves the project from the conversation or asks. No file in the customer's repository.
