# Tandem for AI assistants

One repository, one plugin: the **Tandem MCP connector** plus three **skills**, installable in Claude (claude.ai, Desktop, Cowork, Claude Code), ChatGPT and Codex, Cursor, Gemini CLI and Antigravity, and any client that reads the open [Agent Skills](https://agentskills.io) format.

Tandem is the shared memory of a customer project: people, decisions, plan, conversations, time. This plugin brings it into the assistant you already work in.

| Skill | What it does |
|---|---|
| `start` | Begin a work session on a client project: where it stands, what remains, what changed; then frame the chosen task and keep checking the work against what the customer validated. |
| `sync` | Record the session back into the project: a session record in the project's activity, task updates proposed and confirmed, time logged. |
| `setup` | Onboard from the assistant up to a first live project: guided source connections, project creation, first brief, workspace link. |

The connector is the production Tandem MCP server: `https://api.usetandem.ai/mcp`, OAuth 2.1, user-scoped. Nothing in this repository holds credentials.

## Install

### Claude.ai, Claude Desktop, Claude Cowork

Customize → **Plugins** → **Add marketplace** → enter `tandem-ai/agent-plugins` → install **Tandem**. You are prompted to sign in to Tandem when the connector is first used. Paid plans only. Hooks and sub-agents run in Cowork and Claude Code; in the chat, skills and the connector work and `sync` is run by hand.

Team and Enterprise: an owner adds the same marketplace to the organization (available, auto-installed, or required for everyone).

### Claude Code

```
/plugin marketplace add tandem-ai/agent-plugins
/plugin install tandem@tandem
```

Then `/mcp` → tandem → authenticate. Skills are `/tandem:start`, `/tandem:sync`, `/tandem:setup`. Teams can pre-install through `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": { "tandem": { "source": { "source": "github", "repo": "tandem-ai/agent-plugins" } } },
  "enabledPlugins": { "tandem@tandem": true }
}
```

### ChatGPT and Codex

Codex CLI / IDE / desktop app:

```
codex plugin marketplace add tandem-ai/agent-plugins
codex /plugins        # install Tandem, then: codex mcp login tandem
```

Skills are invoked with `$start`, `$sync`, `$setup` or chosen automatically. In ChatGPT (web, desktop, mobile) the plugin is installed from the Plugins directory once published, or published to a workspace by an admin; a Business/Enterprise admin can import this repository as a marketplace with daily sync. Hooks do not run in ChatGPT web.

### Cursor

Customize → Plugins → install **Tandem** from the marketplace once published, or `/add-plugin` with this repository. Connector alone, one click:

`cursor://anysphere.cursor-deeplink/mcp/install?name=tandem&config=eyJ1cmwiOiJodHRwczovL2FwaS51c2V0YW5kZW0uYWkvbWNwIn0=`

(the `config` is the base64 of `{"url":"https://api.usetandem.ai/mcp"}`). Skills are read from `.agents/skills/`.

### Gemini CLI (Code Assist Standard / Enterprise licences)

```
gemini extensions install https://github.com/tandem-ai/agent-plugins
```

The extension carries the connector (`gemini-extension.json`) and the skills. `gemini extensions update` follows this repository's default branch.

### Antigravity (IDE + `agy` CLI)

```
git clone https://github.com/tandem-ai/agent-plugins
agy plugin install ./agent-plugins
```

`plugin.json` + `mcp_config.json` + `skills/` at the root are the Antigravity layout. Importing the Gemini extension (`agy plugin import gemini`) is also documented for migrated Gemini CLI users.

### GitHub Copilot, VS Code

Connector: add to `.vscode/mcp.json`:

```json
{ "servers": { "tandem": { "type": "http", "url": "https://api.usetandem.ai/mcp" } } }
```

Skills: copy `.agents/skills/` into your repository (Copilot reads `.agents/skills`, `.github/skills`, `.claude/skills`), or install with `gh skill install tandem-ai/agent-plugins <skill>`.

### Gemini app, Gemini Enterprise, any other MCP client

Add the connector URL `https://api.usetandem.ai/mcp` in the client's connected-apps or MCP settings. For skills, upload the `SKILL.md` files from `skills/` where the client accepts skills (Gemini app: Skills page; Gemini Enterprise: Skills, shareable inside the organization).

## What is inside

```
skills/<name>/SKILL.md          the three skills (source of truth)
skills/<name>/references/       per-skill reference material; tandem-mcp.md is copied from reference/
reference/tandem-mcp.md         how to work with the Tandem MCP (two tools, naming, failures, no cards)
hooks/hooks.json + scripts/     Claude Code hooks: announce the linked project at SessionStart; Stop guard for sync=auto
.mcp.json                       the connector, for Claude and Codex
.claude-plugin/                 Claude plugin manifest + marketplace
.codex-plugin/ .agents/plugins/ OpenAI plugin manifest + marketplace
.cursor-plugin/ .cursor/        Cursor plugin manifest + mcp.json
gemini-extension.json GEMINI.md Gemini CLI extension
plugin.json mcp_config.json     Antigravity plugin
.agents/skills/                 generated mirror of skills/ (Codex, Cursor, Copilot, Antigravity read it)
```

### Workspace link

A repository or folder can be linked to a Tandem project with a `.tandem.json` file at its root (`setup` writes it with the user's agreement). `start` reads it to load the right project without asking; `sync` writes `last_sync`; the Claude Code hooks announce the project at session start and, when `sync` is `auto`, ask the assistant to sync before the session ends.

## Develop

```
npm run build   # copies reference/tandem-mcp.md into each skill, mirrors skills/ to .agents/skills/, checks versions
npm run check   # verifies the generated files are current (CI)
```

Edit only `skills/<name>/SKILL.md`, `skills/<name>/references/<own files>.md` and `reference/tandem-mcp.md`, then run the build. Bump the version in every manifest (the build refuses mismatches). Validate the Claude packaging with `claude plugin validate .` before tagging a release.

Open decisions and the plan for this repository are tracked in `.scratch/mcp-plugin-skills/` (wayfinder map).

## Publishing checklist

- Public repository (required by the Claude plugin directory and the Cursor Marketplace).
- Tag a release; marketplaces pin `version` / `ref`.
- Claude: submit the repository at claude.ai/admin-settings/directory/submissions/plugins/new (Team/Enterprise owner) or platform.claude.com/plugins/submit; submit the connector to the Connectors Directory as well.
- OpenAI: developers.openai.com/plugins/deploy/submission (domain verification, identity, test account, 5 positive + 3 negative test cases).
- Cursor: cursor.com/marketplace/publish (open source, manual review).
- Gemini: add the GitHub topic `gemini-cli-extension` for the gallery to index the repository.
- MCP Registry: `mcp-publisher` with a `server.json` under the `com.usetandem` namespace.
