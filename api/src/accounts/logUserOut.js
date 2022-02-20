import jwt from 'jsonwebtoken';

const JWT_SIGNAURE = process.env.JWT_SIGNATURE;

async function logUserOut(request, reply) {
  // delete session from db
  try {
    // get refresh token
    if (request?.cookies?.refreshToken) {
      const {
        cookies: { refreshToken },
      } = request;
      const { session } = await import('../session/session.js');
      // decode session token from refresh token'
      const { sessionToken } = jwt.verify(refreshToken, JWT_SIGNAURE);
      await session.deleteOne({ sessionToken });
    }
    // remove cookies
    reply.clearCookie('refreshToken').clearCookie('accessToken');
  } catch (e) {
    console.error('there was an error logging the user out.');
  }
}

export { logUserOut, logUserOut as default };
