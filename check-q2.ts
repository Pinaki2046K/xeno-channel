import "dotenv/config";
import { messageQueue } from "./src/queues/message.queue";

async function check() {
  const waiting = await messageQueue.getWaitingCount();
  const active = await messageQueue.getActiveCount();
  const completed = await messageQueue.getCompletedCount();
  const failed = await messageQueue.getFailedCount();
  
  console.log("Queue Status:", { waiting, active, completed, failed });
  process.exit(0);
}
check();
