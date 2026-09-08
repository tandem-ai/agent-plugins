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

## When it fails

Point the user to the Integrations page in the app (the base of any `integrations_url`, or `<app>/<account.slug>/integrations`), where a failed connection can be reconnected, and continue with the next provider.
