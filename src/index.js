import './env.js';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import fastifyCookie from 'fastify-cookie';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDb } from './db.js';
import {
  registerUser,
  authorizeUser,
  logUserIn,
  getUserFromCookies,
  logUserOut,
} from './accounts/index.js';

// ESM specific features
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify();
async function startApp() {
  try {
    app.register(fastifyCookie, {
      secret: process.env.COOKIE_SIGNATURE,
    });
    app.register(fastifyStatic, {
      root: path.join(__dirname, 'public'),
    });
    app.post('/api/register', async (req, reply) => {
      const {
        body: { email, password },
      } = req;
      registerUser(email, password).catch((err) => {
        console.error(err);
      });
    });

    app.post('/api/authorize', async (req, reply) => {
      const {
        body: { email, password },
      } = req;

      const { isAuthorized, userId } = await authorizeUser(
        email,
        password
      ).catch((err) => {
        console.error(err);
      });
      if (isAuthorized) {
        await logUserIn(userId, req, reply);
        reply.send({ data: 'User logged in' });
      }
      reply.send({ data: 'auth failed' });
    });

    app.get('/test', {}, async (req, reply) => {
      try {
        const user = await getUserFromCookies(req, reply);
        if (user?._id) {
          reply.send({ data: user });
        } else {
          reply.send({ data: 'User lookup failed' });
        }
      } catch (error) {
        throw new Error(`There was an error with the test: ${error}`);
      }
    });
    app.post('/api/logout', {}, async (req, reply) => {
      try {
        await logUserOut(req, reply);
        reply.send({
          data: 'User logged out.',
        });
      } catch (e) {
        console.error(e);
      }
    });

    await app.listen(3000);
    console.log('🚀 Server Listening at port: 3000');
  } catch (e) {
    console.error(e);
  }
}

connectDb().then(startApp).catch(console.error);
