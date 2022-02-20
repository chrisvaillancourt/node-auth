import { createSession } from './session.js';
import { refreshTokens } from './user.js';

async function logUserIn(userId, request, reply) {
  const connectionInformation = {
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  };
  const sessionToken = await createSession(userId, connectionInformation);
  await refreshTokens(sessionToken, userId, reply);
}

export { logUserIn, logUserIn as default };
