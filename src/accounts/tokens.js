import jwt from 'jsonwebtoken';

const JWT_SIGNAURE = process.env.JWT_SIGNATURE;

async function createTokens(sessionToken, userId) {
  try {
    const refreshToken = jwt.sign({ sessionToken }, JWT_SIGNAURE);
    const accessToken = jwt.sign({ sessionToken, userId }, JWT_SIGNAURE);
    return { accessToken, refreshToken };
  } catch (error) {
    console.error(`error creating token: ${error}`);
  }
}
export { createTokens };
