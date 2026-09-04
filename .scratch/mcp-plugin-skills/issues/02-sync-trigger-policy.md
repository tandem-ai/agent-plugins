# Automatic sync: default mode and trigger
Type: grilling
Status: open

## Question

`.tandem.json` carries `sync: ask | auto | off` and the Claude Code Stop hook enforces `auto`. What is the default `setup` writes, do we also fire on PreCompact (before a long session is summarised) and SessionEnd, and what does "auto" send without a human review (the current draft sends the record as written and says so)? Also: is a Stop guard acceptable UX, or should auto mean "propose, never block"?
