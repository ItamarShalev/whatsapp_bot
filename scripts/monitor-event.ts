import "dotenv/config";
import { BaileysEventMap } from "@whiskeysockets/baileys";
import { z } from "zod";
import { startSock } from "../src/lib/connection";
import { getZodCliErrorMessage } from "../src/lib/utils";
import { logger } from "../src/lib/logger";

const events = [
  "connection.update", // Connection state has been updated -- WS closed, opened, connecting etc.
  "creds.update", // Credentials updated -- some metadata, keys or something
  "messaging-history.set", // Set chats (history sync), everything is reverse chronologically sorted
  "chats.upsert", // Upsert chats
  "chats.update", // Update the given chats
  "chats.phoneNumberShare", // Phone number share in chats
  "chats.delete", // Delete chats with given ID
  "presence.update", // Presence of contact in a chat updated
  "contacts.upsert", // Upsert contacts
  "contacts.update", // Update contacts
  "messages.delete", // Delete messages
  "messages.update", // Update messages
  "messages.media-update", // Media update for messages
  "messages.upsert", // Add/update the given messages
  "messages.reaction", // Message was reacted to
  "message-receipt.update", // Update message receipts
  "groups.upsert", // Upsert groups
  "groups.update", // Update groups
  "group-participants.update", // Apply an action to participants in a group
  "group.join-request", // Group join request
  "blocklist.set", // Set blocklist
  "blocklist.update", // Update blocklist
  "call", // Receive an update on a call
  "labels.edit", // Edit labels
  "labels.association", // Association of labels
] as const satisfies (keyof BaileysEventMap)[];

// Define a Zod schema to validate the command line arguments
const eventsSchema = z.union([
  z.object({
    events: z.array(z.enum(events)).min(1, "At least one event must be specified or use 'all'"),
  }),
  z.object({
    events: z.array(z.literal("all")).default(["all"]),
  }),
]);

// Check if the script is run with at least one argument
const { data, success, error } = eventsSchema.safeParse({
  events: process.argv.slice(2),
});

// If the validation fails, log the error and exit
if (!success) {
  console.error("❌ Invalid options:");
  console.log(error);
  console.error(getZodCliErrorMessage(error));
  process.exit(1);
}

startSock((sock) => {
  // set logger level to info so that we can see the events
  sock.logger.level = "info";

  // Set up the logger to log debug messages
  const eventsToListen = (data.events as string[]).includes("all")
    ? events
    : (data.events as (keyof BaileysEventMap)[]);

  eventsToListen.forEach((evName) => {
    logger.info(`Listening to event: ${evName}`);
    sock.ev.on(evName, (payload) => {
      logger.info({ payload }, `Received event: ${evName}`);
    });
  });
});
