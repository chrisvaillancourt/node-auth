import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { createTokens } from './tokens.js';
import bcrypt from 'bcryptjs'; // TODO change to dynamic import since only used in one fn or refactor password hashing to separate fns
const JWT_SIGNAURE = process.env.JWT_SIGNATURE;

async function getUserFromCookies(request, reply) {
  try {
    //  check if token exists
    const { user } = await import('../user/user.js');
    if (request?.cookies?.accessToken) {
      // decode access token
      const {
        cookies: { accessToken },
      } = request;
      const decodedAccessToken = jwt.verify(accessToken, JWT_SIGNAURE);

      return user.findOne({
        _id: ObjectId(decodedAccessToken?.userId),
      });
    }
    if (request?.cookies?.refreshToken) {
      const {
        cookies: { refreshToken },
      } = request;
      const { session } = await import('../session/session.js');
      const { sessionToken } = jwt.verify(refreshToken, JWT_SIGNAURE);
      const currentSession = await session.findOne({ sessionToken });
      if (currentSession.valid) {
        const currentUser = await user.findOne({
          _id: ObjectId(currentSession.userId),
        });
        await refreshTokens(sessionToken, currentUser._id, reply);
        return currentUser;
      }
    }
  } catch (error) {
    console.error(`There was an error getting the user from cookies: ${error}`);
  }
}

async function refreshTokens(sessionToken, userId, reply) {
  try {
    // TODO refactor to fn and reuse in logUserIn.js
    const { accessToken, refreshToken } = await createTokens(
      sessionToken,
      userId
    );
    const now = new Date();
    const expires = now.setDate(now.getDate() + 30); // 30 days
    const {
      env: { ROOT_DOMAIN: domain },
    } = process;
    reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        domain,
        httpOnly: true,
        expires,
        secure: true, // requires https
      })
      .setCookie('accessToken', accessToken, {
        path: '/',
        domain,
        httpOnly: true,
        secure: true, // requires https
      });
  } catch (error) {
    console.error(`There was an error setting refresh tokens: ${error}`);
    reply.send({
      data: {
        status: 'FAILURE',
      },
    });
  }
}

async function changePassword(userId, newPassword) {
  const { genSalt, hash } = bcrypt;
  const { user } = await import('../user/user.js');
  const salt = await genSalt(10);
  const hashedPassword = await hash(newPassword, salt);
  return user.updateOne(
    { _id: userId },
    {
      $set: {
        password: hashedPassword,
      },
    }
  );
}

export { getUserFromCookies, refreshTokens, changePassword };
