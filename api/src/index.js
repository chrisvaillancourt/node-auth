import './env.js';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCookie from 'fastify-cookie';
import fastifyCors from 'fastify-cors';
import path from 'path';
import { fileURLToPath } from 'url';
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

      const { isAuthorized, userId } = await authorizeUser(
        email,
        password
      ).catch((e) => {
        console.error(`There was an error authorizing the user: ${e}`);
        reply.send({
          data: {
            status: 'FAILURE',
          },
        });
      });
      if (isAuthorized) {
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
      }
      reply.send({ data: { status: 'FAILURE' } });
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
        reply.send({
          data: {
            status: 'SUCCESS',
          },
        });
      } catch (e) {
        console.error(`There was an error logging the user out: ${e}`);
        reply.send({
          data: {
            status: 'FAILURE',
          },
        });
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

    await app.listen(PORT);
    console.log(`🚀 Server Listening at port: ${PORT}`);
  } catch (e) {
    console.error(e);
  }
}

connectDb().then(startApp).catch(console.error);
