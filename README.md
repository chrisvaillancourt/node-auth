# node auth

Intro to rolling your own session-based auth in Node.js.

Session based auth lets you track which devices a user is logged into.
Each time a user signs in, store that info in the database.

## Access token and Refresh token

Access token:

- JWT all info you need to login (user ID and session ID) -> Proves user has access.
- Only available for the current session
  - i.e. delete it when close browser,
- We can delete a session and prevent users from logging in

refresh token:

- jwt
- only contains session id
- DB uses refresh token to check if session is valid
  - invalid? User needs to sign back in. You don't get an access token.
  - Valid? Used to generate new access token
- lasts longer than the access token
- Persists between sessions until (unlike access token) user logs out or session is revoked
- Is sent to server, server generates an access token, server sends access token to client
-

## Process

- generate a JWT and store in a HTTP only cookie
  - JWT: encodes access and refresh token
  - JWT stores refresh and access token
  - Store user session in db collection

## development

1. npm i
2. Run caddy proxy with `caddy run`
3. Run api by running `npm run start` from the `./api` directory
4. Run the ui by running `npm run start` from the `./ui` directory
5. View the deployed app at [nodeauth.dev](https://nodeauth.dev)
6. Login and go to [https://api.nodeauth.dev/test](https://api.nodeauth.dev/test) to test the authorization

### Environment variables

This project expects a `.env` file in the root of the directory with the following variables:

```bash
MONGO_URL=
COOKIE_SIGNATURE=
JWT_SIGNATURE=
ROOT_DOMAIN=nodeauth.dev
```

### Enabling https

1. Update hosts file (below)
2. Install [caddy server](https://caddyserver.com/docs/install)
3. Add `Caddyfile` config in root dir
4. Start caddy reverse proxy
5. [Firefox only] Enable root/local certificate authorities by navigating to `about:config` in Firefox and toggling `security.enterprise_roots.enabled` to `true`

#### Hosts file

Safari doesn't follow standard for allowing secure cookies on `localhost` domains. We can work around this by updating our hosts file and running a reverse proxy with caddy server.

##### Modify hosts file

Add `127.0.0.1 nodeauth.dev` as a new entry to your hosts file. On macos this is located at `/private/etc/hosts`.
