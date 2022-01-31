import jwt from 'jsonwebtoken';
const JWT_SIGNAURE = process.env.JWT_SIGNATURE;

async function getUserFromCookies(request) {
  try {
    //  check if token exists
    if (request?.cookies?.accessToken) {
      // decode access token
      const {
        cookies: { accessToken },
      } = request;
      const decodedAccessToken = jwt.verify(accessToken, JWT_SIGNAURE);
      console.log(decodedAccessToken);
    } else {
      console.error('no access token');
    }
    // TODO:
    // get access and refresh tokens
    // check if access token
    // Decode access token
    // return user from record
    // Decode refresh token
    // confirm session is valid
    // check if valid session?
    // look up user
    // generatre refresh token
    // return current user
  } catch (error) {}
}

async function refreshTokens() {
  try {
  } catch (error) {}
}

export { getUserFromCookies, refreshTokens };