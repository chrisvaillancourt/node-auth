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
  -

## development

1. npm i
2. Run with nodemon. To install nodemon, run `npm i -g nodemon`
