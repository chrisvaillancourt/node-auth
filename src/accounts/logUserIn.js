import { createSession } from './session.js';

async function logUserIn(userId, request, reply) {
  const connectionInformation = {
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  };
  const sessionToken = await createSession(userId, connectionInformation);

  // TODO complete login flow
}

export { logUserIn };
