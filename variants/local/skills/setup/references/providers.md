# Providers — how each one connects

Use with step 4 of the setup skill. Authorization and keys are always entered in the Tandem app (Integrations page), never in the chat. `integration_key` values come from `connect_integration` at run time; do not hardcode them.

## Which providers answer which need

| The user says… | Propose |
|---|---|
| Exchanges with the customer happen in Slack | Slack |
| …in Microsoft Teams | Teams |
| …by email | Gmail |
| Calls are recorded | The recorder they use: Granola, Grain, Fathom, Avoma, Fireflies, Krisp |
| Meetings are on Google Calendar | Google Calendar |
| The plan lives in a tracker | Asana, Jira, Linear, Rocketlane, or Google Sheets (an import, see the skill's step 3) |
| Documents live in Drive or Notion | Google Drive, Notion (linked per document, not attached as a source) |
| The customer's account lives in a CRM | HubSpot |
| Code is on GitHub | GitHub |

Connecting makes a tool available to the account; it reads nothing until it is attached to a project.

## OAuth providers (authorize in the browser)

Recipe to give: open the Tandem Integrations link → **Connect** → the provider's consent screen opens → sign in and accept → back in Tandem the connection appears under the provider. There is no field to fill.

| Provider | What the user authorizes | Who can | After connecting |
|---|---|---|---|
| Slack | Tandem's Slack app in their workspace | Any member by default. When the workspace requires approved apps, the install becomes a request to the workspace owners or app managers, and the user waits for it | Pick channels to attach; the Tandem bot must be a member of a public channel (the skill can add it); private channels need `/invite @Tandem` |
| Microsoft Teams | Tandem in their Microsoft 365 tenant | The user; some tenants require admin consent | Pick teams/channels |
| Gmail, Google Calendar, Google Drive, Google Sheets | One Google sign-in, the scopes of the tool chosen | The user, with their own Google account | Gmail and Calendar filter by the customer's domain; Drive documents are linked per document |
| Notion | The pages or databases they select in Notion's consent screen | The user | Documents are linked per page; a Notion database can be imported as the plan |
| HubSpot | Their HubSpot portal | A Super Admin, or a user with the App Marketplace Access permission | Deals and contacts are read per customer |
| Linear, Asana, Jira, Rocketlane | Their workspace or site | The user | The project is imported from the tracker with its tasks and kept synced |
| GitHub | The Tandem GitHub App on the organization or selected repositories | An org owner. A repo admin can install it on the repositories they admin unless the org restricts that; anyone on their own personal account | Pick repositories to attach |
| Krisp | Krisp's MCP server, OAuth | The user | Call recordings flow in |

## API-key providers (create the key at the provider, paste it in the Tandem form)

Give the exact page, the plan, and the scope, in this order: open the key page → create the key with the scope named → open the Tandem Integrations link → paste the key in the form → say "done".

| Provider | Where the key is created | Plan and scope to know |
|---|---|---|
| Granola | Granola **desktop app** → Settings → Connectors → API keys → Create new key. No web page for it. Docs: https://docs.granola.ai/help-center/sharing/integrations/granola-api | Business or Enterprise plan. Scope **Personal notes** (notes they own or were shared) or **Public notes** (workspace-visible notes) decides which meetings Tandem reads. Only notes with a generated summary and transcript come through. |
| Grain | https://grain.com/app/settings/integrations?tab=api (Workspace settings → Integrations → API) → Personal access token. Docs: https://support.grain.com/en/articles/15507288-grain-api | Starter plan or above (not Free). A personal token reads the user's own recordings; a workspace token needs workspace admin rights. |
| Fathom | https://fathom.video/customize#api-access-header (User Settings → API Access) → Generate API key. Docs: https://developers.fathom.ai/quickstart | No plan restriction documented. Reads the meetings recorded by, or shared with, the user who created the key. |
| Avoma | Avoma → Settings → Organization → Developer → Add API Key. Docs: https://help.avoma.com/api-integration-for-avoma | Organization admins only. The key is one string `CLIENT_KEY:CLIENT_SECRET`; paste it whole. |
| Fireflies | https://app.fireflies.ai/integrations/custom/fireflies (Integrations → Fireflies API → Get API Key, or Settings → Developer settings). Docs: https://docs.fireflies.ai/fundamentals/authorization | All plans. Reads the meetings of the user who owns the key. |

## Walkthroughs for the providers that need more than a consent screen

Give these step by step, one provider at a time, and wait for "done" between the connect half and the attach half.

### HubSpot

1. **Who**: a HubSpot Super Admin, or a user with the **App Marketplace Access** permission (Settings → Users & Teams → the user → Account → App Marketplace Access). Anyone else gets "Request for integration permissions": have them ask an admin, or do it from the admin's session.
2. **Connect**: Tandem Integrations link → HubSpot → Connect → HubSpot asks which account (portal) when they have several; pick the one holding the customer's deals → Connect app.
3. **Scope on the project**: Tandem follows **one deal per project** (`params: { dealId }`). `list_integrations` carries no deal list, so find it: ask the user for the deal's name as written in HubSpot (the customer's company name is not enough, deals are found by the deal's own name), run `hubspot.find_deals` with that query, show the matches with stage, amount and close date, let them pick, and pass the numeric record id as a **string**.
4. **What is read**: the deal's property history (stage, amount, close date, owner) and the notes, calls, meetings and emails logged on it. Emails come back redacted when the HubSpot account has no `sales-email-read` scope; say so if email bodies are missing later.

### Slack

1. **Who**: any member, unless the workspace requires approved apps; then Connect submits a request to the workspace owners or app managers and the user waits for their approval before retrying.
2. **Connect**: Tandem Integrations link → Slack → Connect → Slack asks which workspace (top right) → Allow. The connection is the workspace; channels are chosen per project.
3. **Scope on the project**: `scope_choices` lists the channels. For a **public** channel with `is_member: false`, call `join_slack_channel` with the coordinates from `slack_channels`; Tandem then reads it. For a **private** channel Tandem cannot add itself: a member runs `/invite @Tandem` in that channel, then the attach works. A channel absent from the list is private and Tandem is not in it yet.
4. Tandem reads only channels attached to a project, nothing else in the workspace.

### Microsoft Teams

1. **Who**: the user, with their Microsoft 365 account. Some tenants block user consent: the consent screen then says "Approval required"; the user submits the request and an Entra admin grants it (Entra admin center → Enterprise applications → Admin consent requests), after which Connect is retried.
2. **Connect**: Tandem Integrations link → Teams → Connect → Microsoft sign-in → Accept.
3. **Scope on the project**: `scope_choices` lists team → channel pairs (`Team · channel`); pick those the customer's work happens in. Only teams the user belongs to are listed.

### GitHub

1. **Who**: an organization owner installs the Tandem GitHub App on the organization. A repository admin can install it on the repositories they admin unless the org restricts that, in which case GitHub emails the owners a request. Personal repositories: the owner.
2. **Connect**: Tandem Integrations link → GitHub → Connect → GitHub asks where to install (organization or personal account) → **Only select repositories** and pick the customer's repositories, or All repositories → Install.
3. **Scope on the project**: `scope_choices` lists the repositories the installation covers; pick them as `owner/name`. Optional `filterTerms` (e.g. a ticket prefix `ACM-`) keeps only commits and pull requests mentioning those terms. A repository missing from the list was not included in the installation: fix it on GitHub (Settings → Applications → Tandem → Repository access).

### Gmail and Google Calendar

1. **Who**: the user, with their own Google account. A connection reads **that person's** mailbox or calendar, so a teammate's connection is theirs, not the user's: offer to connect the user's own.
2. **Connect**: Tandem Integrations link → Gmail (or Calendar) → Connect → Google account chooser → tick every requested permission → Continue. On Workspace tenants that block third-party apps, the admin allowlists Tandem in the Google Admin console (Security → API controls → App access control).
3. **Scope on the project**: none to ask. Omit `domains` and the customer company's domain is applied; only messages or events with someone from that domain are read. If the customer writes from several domains, pass them all.

### Notion and Google Drive

These are not attached as sources; they are linked per document. After connecting (Notion: pick the pages or databases to share on Notion's consent screen; Drive: Google sign-in), ask the user for the URL of each document that matters (statement of work, kick-off notes, project plan) and call `link_document` with the project's `implementation_id` and the URL. A Notion page that was not shared on the consent screen fails verification: they share it in Notion (··· → Connections → Tandem) and retry. A Notion database that holds the plan is an import instead (skill step 3).

## When it fails

Point the user to the Integrations page in the app (the base of any `integrations_url`, or `<app>/<account.slug>/integrations`), where a failed connection can be reconnected, and continue with the next provider.
