import { messageQueue } from "./src/queues/message.queue";

async function check() {
  const waiting = await messageQueue.getWaitingCount();
  const active = await messageQueue.getActiveCount();
  const completed = await messageQueue.getCompletedCount();
  const failed = await messageQueue.getFailedCount();
  const delayed = await messageQueue.getDelayedCount();
  
  console.log({ waiting, active, completed, failed, delayed });
  process.exit(0);
}
check();
