import { MongoClient } from "mongodb";
const url = process.env.MONGO_URL;

export const client = new MongoClient(url);

export async function connectDb() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("connected to db");
  } catch (error) {
    console.error(error);
    await client.close(); // close if there's an error
  }
}
