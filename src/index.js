import "./env.js";
import { fastify } from "fastify";
import fastifyStatic from "fastify-static";
import fastifyCookie from "fastify-cookie";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./db.js";
import { registerUser, authorizeUser } from "./accounts/index.js";
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
      root: path.join(__dirname, "public"),
    });
    app.post("/api/register", async (req, reply) => {
      const {
        body: { email, password },
      } = req;
      registerUser(email, password).catch((err) => {
        console.error(err);
      });
    });

    app.post("/api/authorize", async (req, reply) => {
      const {
        body: { email, password },
      } = req;

      const isAuthorized = authorizeUser(email, password).catch((err) => {
        console.error(err);
      });
      reply
        .setCookie("test-cookie", "the value is this", {
          path: "/",
          domain: "localhose",
          httpOnly: true,
          // secure: true // requires https
        })
        .send({ data: "just testing" });
    });

    await app.listen(3000);
    console.log("🚀 Server Listening at port: 3000");
  } catch (e) {
    console.error(e);
  }
}

connectDb().then(startApp).catch(console.error);
