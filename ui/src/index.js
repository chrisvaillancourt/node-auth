import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { fastify } from 'fastify';
import fastifyStatic from 'fastify-static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 3000;
const app = fastify();

async function startApp() {
  app.register(fastifyStatic, {
    root: join(__dirname, 'public'),
  });
  await app.listen(PORT);
  console.log(`🚀 server listening on port ${PORT}`);
}

startApp().catch((error) =>
  console.error('there was an error serving the ui: ', error)
);
