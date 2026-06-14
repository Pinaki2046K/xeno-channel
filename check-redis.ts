import "dotenv/config";
import { connection } from "./src/queues/message.queue";

async function check() {
  console.log("REDIS_URL:", process.env.REDIS_URL);
  try {
    await connection.ping();
    console.log("Redis connected successfully!");
  } catch (e) {
    console.error("Redis connection failed:", e);
  }
  process.exit(0);
}
check();
