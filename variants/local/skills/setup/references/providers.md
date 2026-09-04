# Providers — how each one connects

Use with step 3 of the setup skill. Authorization and keys are always entered in the Tandem app (Integrations page), never in the chat. `integration_key` values come from `connect_integration` at run time; do not hardcode them.

## Which providers answer which need

| The user says… | Propose |
|---|---|
| Exchanges with the customer happen in Slack | Slack |
| …in Microsoft Teams | Teams |
| …by email | Gmail |
| Calls are recorded | The recorder they use: Granola, Grain, Fathom, Avoma, Fireflies, Krisp |
| Meetings are on Google Calendar | Google Calendar |
| The plan lives in a tracker | Asana, Jira, Linear, Rocketlane, or Google Sheets |
| Documents live in Drive or Notion | Google Drive, Notion |
| The customer's account lives in a CRM | HubSpot |
| Code is on GitHub | GitHub |

Connecting makes a tool available to the account; it reads nothing until it is attached to a project (step 4).

## OAuth providers (authorize in the browser)

| Provider | What the user authorizes | Who can | After connecting |
|---|---|---|---|
| Slack | Tandem's Slack app in their workspace | A workspace admin, or a member if the workspace allows app installs; otherwise the request goes to admins for approval | Pick channels to attach; the Tandem bot must be a member of a public channel (the skill can add it); private channels need `/invite @Tandem` |
| Microsoft Teams | Tandem in their Microsoft 365 tenant | The user; some tenants require admin consent | Pick teams/channels |
| Gmail, Google Calendar, Google Drive, Google Sheets | One Google sign-in, the scopes of the tool chosen | The user, with their Google account | Gmail and Calendar filter by the customer's domain; Drive documents are linked per document |
| Notion | The pages or databases they select in Notion's consent screen | The user | Documents are linked per page; a Notion database can be imported as the plan |
| HubSpot | Their HubSpot portal | Portal admin or a user with app-install rights | Deals and contacts are read per customer |
| Linear, Asana, Jira, Rocketlane | Their workspace or site | The user | The project is imported from the tracker with its tasks and kept synced |
| GitHub | The Tandem GitHub App on the organization or selected repositories | An org owner, or a repo admin for personal repos | Pick repositories to attach |
| Krisp | Krisp's MCP server, OAuth | The user | Call recordings flow in |

## API-key providers (create the key at the provider, paste it in the Tandem form)

| Provider | Where the key is created | Plan and scope to know |
|---|---|---|
| Granola | Granola → workspace settings → API keys (`grn_…`) — https://docs.granola.ai/help-center/sharing/integrations/granola-api | Business or Enterprise plan. Key scope "Personal notes" or "Public notes" decides which meetings Tandem can read. Only notes with a generated summary and transcript are returned. |
| Grain | Grain Public API — https://developers.grain.com/ | Access token created from the user's Grain settings; the provider page states the plan requirement. |
| Fathom | Fathom API — https://developers.fathom.ai/ | API key created from Fathom settings; the provider page states the plan requirement. |
| Avoma | Avoma API — https://dev.avoma.com/ | API key from Avoma admin settings. |
| Fireflies | Fireflies API — https://docs.fireflies.ai/ | API key created from Fireflies settings (Integrations → Fireflies API). |

Steps to give, in this order: open the provider page above → create the key with the scope named here → open the Tandem link the skill sends → paste the key in the form → come back and say "done".

## When it fails

Point the user to the Integrations page in the app (`https://app.usetandem.com/<account.slug>/integrations`), where a failed connection can be reconnected, and continue with the next provider.
