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
      reply.code(200).send('all is well');
    } catch (error) {
      console.error('There was an error verifying the email: ', error);
      reply.send({
        data: {
          status: 'FAILURE',
        },
      });
    }
  });

  await app.listen(PORT);
  console.log(`🚀 server listening on port ${PORT}`);
}

startApp().catch((error) =>
  console.error('there was an error serving the ui: ', error)
);
