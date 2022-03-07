import './env.js';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCookie from 'fastify-cookie';
import fastifyCors from 'fastify-cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticator } from 'otplib';
import { connectDb } from './db.js';
import {
  registerUser,
  authorizeUser,
  logUserIn,
  getUserFromCookies,
  logUserOut,
  createVerifyEmailLink,
  validateVerifyEmail,
  changePassword,
  createResetLink,
  validateResetEmail,
  register2FA,
} from './accounts/index.js';
import { sendEmail } from './mail/index.js';

// ESM specific features
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3001;

const app = fastify();
async function startApp() {
  try {
    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SIGNATURE,
    });
    app.register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
    });
    app.register(fastifyCors, {
      origin: [/\.nodeauth.dev/, 'https://nodeauth.dev'],
      credentials: true,
    });
    app.post('/api/register', async (req, reply) => {
      try {
        const {
          body: { email, password },
        } = req;
        const userId = await registerUser(email, password);
        if (userId) {
          const emailVerifyLink = await createVerifyEmailLink(email);
          await logUserIn(userId, req, reply);
          sendEmail({
            to: email,
            subject: 'Verify your email',
            html: `<a href="${emailVerifyLink}">Click to verify email.</a>`,
          });

          reply.send({
            data: {
              status: 'SUCCESS',
              userId,
            },
          });
        }
      } catch (e) {
        console.log(e);
        reply.send({
          data: {
            status: 'FAILURE',
          },
        });
      }
    });

    app.post('/api/authorize', async (req, reply) => {
      const {
        body: { email, password },
      } = req;

      const { isAuthorized, userId, authenticatorSecret } = await authorizeUser(
        email,
        password
      ).catch((e) => {
        console.error(`There was an error authorizing the user: ${e}`);
        reply.code(500).send({
          data: {
            status: 'FAILURE',
          },
        });
      });
      if (isAuthorized && !authenticatorSecret) {
        await logUserIn(userId, req, reply).catch((e) => {
          console.error(`There was an error logging the user in: ${e}`);
          reply.send({ data: { status: 'ERROR' } });
        });
        reply.send({
          data: {
            status: 'SUCCESS',
            userId,
          },
        });
      } else if (isAuthorized && authenticatorSecret) {
        reply.send({
          data: {
            status: '2fa',
          },
        });
      }
      reply.code(401).send({ data: { status: 'FAILURE' } });
    });

    app.get('/test', {}, async (req, reply) => {
      try {
        const user = await getUserFromCookies(req, reply);
        if (user?._id) {
          reply.send({ data: user });
        } else {
          reply.send({
            data: {
              status: 'FAILURE',
            },
          });
        }
      } catch (error) {
        throw new Error(`There was an error with the test: ${error}`);
      }
    });
    app.post('/api/logout', {}, async (req, reply) => {
      try {
        await logUserOut(req, reply);
        reply.code(200).send();
      } catch (e) {
        console.error(`There was an error logging the user out: ${e}`);
        reply.code(500).send();
      }
    });
    app.post('/api/verify', {}, async (request, reply) => {
      const {
        body: { token, email },
      } = request;
      const isValid = validateVerifyEmail(token, email);
      isValid ? reply.code(200).send() : reply.code(401).send();
    });
    app.post('/api/change-password', {}, async (request, reply) => {
      try {
        const user = await getUserFromCookies(request, reply);
        const {
          email: { address: email },
        } = user;
        const {
          body: { oldPassword, newPassword },
        } = request;
        if (email && oldPassword) {
          const { isAuthorized, userId } = await authorizeUser(
            email,
            oldPassword
          );
          const updateUserPassword = async () => {
            await changePassword(userId, newPassword);
            reply.code(200).send();
          };
          isAuthorized
            ? updateUserPassword()
            : reply.code(401).send({ data: { status: 'failed' } });
        }
        reply.code(401).send();
      } catch (error) {
        console.error("there was an error changing the user's password", error);
        reply.code(401);
      }
    });
    app.post('/api/forgot-password', {}, async (request, reply) => {
      try {
        const {
          body: { email },
        } = request;
        const resetLink = await createResetLink(email);
        if (resetLink) {
          sendEmail({
            to: email,
            subject: 'Reset your Password',
            html: `<a href="${resetLink}">Click to reset your password.</a>`,
          });
        }
        reply.code(200).send();
      } catch (error) {
        reply.code(500).send();
      }
    });
    app.post('/api/reset', {}, async (request, reply) => {
      try {
        const {
          body: { email, time, newPassword, token },
        } = request;
        const isValid = validateResetEmail(token, email, time);
        if (isValid) {
          const { user } = await import('./user/user.js');
          const foundUser = await user.findOne({
            'email.address': email,
          });
          const userId = foundUser?._id;
          if (userId) {
            await changePassword(userId, newPassword);
            reply.code(200).send('Password updated');
          }
          reply.code(500).send();
        }
        reply.code(401).send('Password update failed');
      } catch (error) {
        reply.code(500).send();
      }
    });
    app.get('/api/user', {}, async (request, reply) => {
      const user = await getUserFromCookies(request, reply);
      user ? reply.send({ data: { user } }) : reply.code(401).send();
    });
    app.post('/api/2fa-register', {}, async (request, reply) => {
      // todo catch errors
      const user = await getUserFromCookies(request, reply).catch((error) =>
        console.error('Error getting user from cookies: ', error)
      );
      const {
        body: { token, secret },
      } = request;
      const isValid = authenticator.verify({ token, secret });
      // TODO store token with user and check 2fa when logging in
      if (user._id && isValid) {
        const { acknowledged } = await register2FA(user._id, secret).catch(
          (error) => {
            console.error(
              'There was an error registering the 2fa secret: ',
              error
            );
            reply.code(500).send();
          }
        );
        if (acknowledged) reply.code(200).send();
      }
      reply.code(401).send();
    });
    app.post('/api/2fa-verify', {}, async (request, reply) => {
      const {
        body: { token, email, password },
      } = request;
      const {
        isAuthorized,
        userId,
        authenticatorSecret: secret,
      } = await authorizeUser(email, password).catch((e) => {
        console.error(`There was an error authorizing the user: ${e}`);
        reply.code(500).send({
          data: {
            status: 'FAILURE',
          },
        });
      });

      const isValid = authenticator.verify({ token, secret });
      if (userId && isValid && isAuthorized) {
        await logUserIn(userId, request, reply).catch((err) => {
          console.error('There was an error logging the user in: ', err);
          reply.code(500).send();
        });
        reply.send({
          data: {
            status: 'SUCCESS',
            userId,
          },
        });
      }

      reply.code(401).send();
    });

    await app.listen(PORT);
    console.log(`🚀 Server Listening at port: ${PORT}`);
  } catch (e) {
    console.error(e);
  }
}

connectDb().then(startApp).catch(console.error);
