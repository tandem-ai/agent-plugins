# Server: a capability that returns a Nango connect link
Type: task
Status: open

## Question

`setup` step 3 today sends the user to `https://app.usetandem.ai/<slug>/integrations?integration=<integration_key>`. Build the server capability that mints a Nango connect session (existing `POST /nango/connect-session`, returns `sessionToken`) and returns a time-limited hosted Connect URL for one `integration_key`, so the user authorises or pastes an API key in Nango's UI without leaving the conversation flow. Record: capability id, TTL, what the skill should call after the user says "done". Verify the self-hosted Nango Connect UI accepts being opened as a hosted page with the token.
