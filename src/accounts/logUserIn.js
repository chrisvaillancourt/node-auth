import { createSession } from './session.js';
import { createTokens } from './tokens.js';

async function logUserIn(userId, request, reply) {
  const connectionInformation = {
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  };
  const sessionToken = await createSession(userId, connectionInformation);

  const { accessToken, refreshToken } = await createTokens(
    sessionToken,
    userId
  );
  const now = new Date();
  const expires = now.setDate(now.getDate() + 30); // 30 days
  reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      domain: 'localhost',
      httpOnly: true,
      // secure: true // requires https
      expires,
    })
    .setCookie('accessToken', accessToken, {
      path: '/',
      domain: 'localhost',
      httpOnly: true,
      // secure: true // requires https
    });
}

export { logUserIn };
