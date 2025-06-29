import "dotenv/config";
import { startSock } from "./lib/connection";
import { handleContactUpsert, handleGroupsUpsert, handleMessagesUpsert } from "./lib/handlers";
import { handlePrismaDisconnect } from "./lib/prisma";

const gracefulShutdown = async () => {
  await handlePrismaDisconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

startSock((sock) => {
  // On new messages
  sock.ev.on("messages.upsert", handleMessagesUpsert);

  // On contact updates (e.g., new contacts added or existing contacts updated)
  sock.ev.on("contacts.upsert", handleContactUpsert);

  // When groups are added or updated
  sock.ev.on("groups.upsert", handleGroupsUpsert);
});
