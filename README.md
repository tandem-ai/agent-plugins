# Tandem for AI assistants

One repository, one plugin: the **Tandem MCP connector** plus two **skills**, installable in Claude (claude.ai, Desktop, Cowork, Claude Code), ChatGPT and Codex, Cursor, Gemini CLI and Antigravity, and any client that reads the open [Agent Skills](https://agentskills.io) format.

Tandem is the shared memory of a customer project: people, decisions, plan, conversations, time. This plugin brings it into the assistant you already work in. It never runs on its own: the user asks, reviews, decides.

| Skill | What it does |
|---|---|
| `sync` | Save the current work session into its Tandem project as a document the team reads in the app and the Tandem copilot can search. The assistant summarises its own session; the user reviews; then, on request, task updates and time. |
| `setup` | Onboard from the assistant up to a first live project: the project first, then guided source connections and attach, then the reading. |

The connector is the production Tandem MCP server: `https://api.usetandem.ai/mcp`, OAuth 2.1, user-scoped. Nothing in this repository holds credentials.

## Install

### Claude.ai, Claude Desktop, Claude Cowork

Customize → **Plugins** → **Add marketplace** → enter `tandem-ai/agent-plugins` → install **Tandem**. You are prompted to sign in to Tandem when the connector is first used. Paid plans only.

**Each member installs it themselves**, and that is the supported route: Claude's
organization marketplaces (Organization settings → Plugins) only accept a
**private or internal** repository the org's own owner can reach, so no admin can
push this public marketplace out to a team.

A team that wants central control — auto-installed or required for everyone —
mirrors this repository into a private repository of their own and adds that
instead. Everything here is generated from one source, so a mirror is a plain
`git push` of `main` to a second remote.

### For a customer's IT admin: no marketplace needed

An organization marketplace only accepts a private repository the org's own
owner can reach, so neither half of this plugin has to go that route:

1. **The connector, once, for everyone.** Organization settings → **Connectors**
   → **Add** → `https://api.usetandem.ai/mcp`. Members then sign in
   individually, so Claude only ever reaches what each person can already see.
   Enterprise plans can provision it through their identity provider instead, and
   people get it on first login.
2. **The skills, as uploads.** Run `npm run package:skills` here and send the two
   files from `dist/skills/`. The owner adds each in Organization settings →
   **Skills** → **Add**. Members get them from the directory, marked as
   provisioned by the organization.

That is the whole install for a team: one URL and two zips, no repository, no
mirror, no admin access to anything of ours.

### Claude Code

```
/plugin marketplace add tandem-ai/agent-plugins
/plugin install tandem@tandem
```

Then `/mcp` → tandem → authenticate. Skills are `/tandem:sync` and `/tandem:setup`. Teams can pre-install through `.claude/settings.json`:

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

Skills are invoked with `$sync`, `$setup` or chosen automatically. In ChatGPT (web, desktop, mobile) the plugin is installed from the Plugins directory once published, or published to a workspace by an admin; a Business/Enterprise admin can import this repository as a marketplace with daily sync.

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

`plugin.json` + `mcp_config.json` + `skills/` at the root are the Antigravity layout.

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
skills/<name>/SKILL.md          the two skills (source of truth)
skills/<name>/references/       per-skill reference material; tandem-mcp.md is copied from reference/
reference/tandem-mcp.md         how to work with the Tandem MCP (two tools, naming, failures, no cards, links)
.mcp.json                       the connector, for Claude and Codex
.claude-plugin/                 Claude plugin manifest + marketplace
.codex-plugin/ .agents/plugins/ OpenAI plugin manifest + marketplace
.cursor-plugin/ .cursor/        Cursor plugin manifest + mcp.json
gemini-extension.json GEMINI.md Gemini CLI extension
plugin.json mcp_config.json     Antigravity plugin
.agents/skills/                 generated mirror of skills/ (Codex, Cursor, Copilot, Antigravity read it)
```

No hooks, no background behaviour: every write goes through the user's confirmation in their assistant.

### How `sync` stores a session

`sync` writes a markdown document into the project through the `create_document` capability. Tandem stores it as a real project document, indexes it, and the Tandem copilot retrieves it through project document search when someone asks what was decided or delivered. The document format is `skills/sync/references/session-record.md`.

## Branding

`assets/icon.png` is the shared logo for Codex and Cursor, including the generated stage and local variants. Replace this file to update the logo, then run `npm run build`. Codex uses it in light and dark mode.

Claude plugin manifests have no documented icon field. The asset is available for directory branding, but packaging it does not set the icon of Claude's remote MCP connector.

## Develop

```
npm run build   # copies reference/tandem-mcp.md into each skill, mirrors skills/ to .agents/skills/, checks versions
npm run check   # verifies the generated files are current (CI)
```

Edit only `skills/<name>/SKILL.md`, `skills/<name>/references/<own files>.md` and `reference/tandem-mcp.md`, then run the build. Bump the version in every manifest (the build refuses mismatches; a version bump is also what makes `plugin update` re-copy the files). Validate the Claude packaging with `claude plugin validate .` before tagging a release. The manifest must not name `.mcp.json` or `hooks/hooks.json`: Claude Code loads the defaults itself and refuses a duplicate.

Open decisions and the plan for this repository are tracked in `.scratch/mcp-plugin-skills/` (wayfinder map).

## Publishing checklist

- Public repository (required by the Claude plugin directory and the Cursor Marketplace).
- Tag a release; marketplaces pin `version` / `ref`.
- Claude: submit the repository at claude.ai/admin-settings/directory/submissions/plugins/new (Team/Enterprise owner) or platform.claude.com/plugins/submit; submit the connector to the Connectors Directory as well.
- OpenAI: developers.openai.com/plugins/deploy/submission (domain verification, identity, test account, 5 positive + 3 negative test cases).
- Cursor: cursor.com/marketplace/publish (open source, manual review).
- Gemini: add the GitHub topic `gemini-cli-extension` for the gallery to index the repository.
- MCP Registry: `mcp-publisher` with a `server.json` under the `com.usetandem` namespace.
