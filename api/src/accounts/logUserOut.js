import jwt from 'jsonwebtoken';

const {
  env: { ROOT_DOMAIN, JWT_SIGNATURE },
} = process;
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
      const { sessionToken } = jwt.verify(refreshToken, JWT_SIGNATURE);

      await session.deleteOne({ sessionToken });
    }
    // remove cookies
    const cookieOpts = {
      path: '/',
      domain: ROOT_DOMAIN,
      httpOnly: true,
      secure: true,
    };
    reply
      .clearCookie('refreshToken', cookieOpts)
      .clearCookie('accessToken', cookieOpts);
  } catch (e) {
    console.error('there was an error logging the user out.');
  }
}

export { logUserOut, logUserOut as default };
