# Per-platform packaging
Type: research
Status: resolved

## Question

How does one repository serve Claude, ChatGPT/Codex, Cursor, Gemini CLI, Antigravity and Copilot with the same skills?

## Answer

Verified against official docs on 2026-09-03/04 (see the platform exploration doc for URLs).

- Source of truth: `skills/<name>/SKILL.md` (agentskills.io format). `.agents/skills/` is a generated mirror for clients that read that path (Codex, Cursor, Copilot, Antigravity).
- Claude: `.claude-plugin/plugin.json` + `.claude-plugin/marketplace.json` (source `./`), `.mcp.json` (`type: http`), `hooks/hooks.json`. Same plugin installs in claude.ai chat, Desktop, Cowork, Claude Code; hooks and sub-agents run only in Cowork and Code.
- OpenAI: `.codex-plugin/plugin.json` (skills, mcpServers → `.mcp.json`, interface) + `.agents/plugins/marketplace.json`. One directory for ChatGPT and Codex. Hooks documented for Codex only.
- Cursor: `.cursor-plugin/plugin.json` + `.cursor/mcp.json` (`url`). Marketplace requires open source + manual review. Deep link format documented; remote-URL config untested (ticket 09).
- Gemini CLI: `gemini-extension.json` (`httpUrl`) + `GEMINI.md`; enterprise licences only since 2026-06-18. Antigravity: root `plugin.json` + `mcp_config.json` (`serverUrl`); `agy plugin install <path>` documented, GitHub-URL install and `agy plugin import gemini` not found in official docs (ticket 06).
- Copilot/VS Code: no bundle; `.vscode/mcp.json` + skills from `.agents/skills`.
- Field names that differ per platform: `type/url` (Claude, Codex), `url` (Cursor), `httpUrl` (Gemini), `serverUrl` (Antigravity). Exact manifest schemas for Cursor and OpenAI plugin/marketplace files were taken from docs summaries and need `claude plugin validate` / `codex` validation before the first tag (ticket 08).
