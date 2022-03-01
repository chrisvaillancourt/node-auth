import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Agent } from 'https';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';
import fetch from 'cross-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 3000;
const app = fastify();

async function startApp() {
  app.register(fastifyStatic, {
    root: join(__dirname, 'public'),
  });
  app.get('/verify/:email/:token', {}, async (request, reply) => {
    try {
      const {
        params: { email, token },
      } = request;
      const values = { email, token };

      const httpsAgent = new Agent({
        rejectUnauthorized: false,
      });

      const res = await fetch('https://api.nodeauth.dev/api/verify', {
        method: 'POST',
        credentials: 'include',
        agent: httpsAgent,
        body: JSON.stringify(values),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      console.log(res);
      res.status == 200 ? reply.redirect('/') : reply.code(401).send();
    } catch (error) {
      console.error('There was an error verifying the email: ', error);
      reply.code(401).send();
    }
  });
  app.get('/reset/:email/:expiration/:token', {}, async (_, reply) => {
    try {
      return reply.sendFile('reset.html');
    } catch (error) {
      console.error(error);
    }
  });
  app.get('/2fa', {}, async (request, reply) => {
    try {
      return reply.sendFile('2fa.html');
    } catch (error) {
      console.error(error);
    }
  });

  await app.listen(PORT);
  console.log(`🚀 server listening on port ${PORT}`);
}

startApp().catch((error) =>
  console.error('there was an error serving the ui: ', error)
);
