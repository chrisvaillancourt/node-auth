import { randomBytes } from "crypto";
async function createSession(userId, connection) {
  try {
    const sessionToken = randomBytes(43).toString("hex");
    const { ip, userAgent } = connection;
    const { session } = await import("../session/session.js");
    session.insertOne({
      sessionToken,
      userId,
      valid: true,
      userAgent,
      ip,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
  } catch (error) {
    throw new Error(`Session creation failed: ${error}`);
  }
}

export { createSession };
