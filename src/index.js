import "./env.js";
import { fastify } from "fastify";
import fastifyStatic from "fastify-static";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./db.js";

// ESM specific features
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify();
async function startApp() {
  try {
    app.register(fastifyStatic, {
      root: path.join(__dirname, "public"),
    });
    app.post("/api/register", async (req, reply) => {
      console.log(req.body.email, req.body.password);
    });

    await app.listen(3000);
    console.log("🚀 Server Listening at port: 3000");
  } catch (e) {
    console.error(e);
  }
}

connectDb().then(startApp).catch(console.error);
