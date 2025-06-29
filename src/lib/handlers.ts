import { BaileysEventMap } from "@whiskeysockets/baileys";
import { parseJid, parseParams, extractMessageText } from "./utils";
import { upsertContact } from "../repositories/contact-repository";
import { logger } from "./logger";
import { prisma } from "./prisma";
import { getCmd } from "./commands";
import env from "./env";

/**
 * Handles the `messages.upsert` event from Baileys.
 * @param m - The messages.upsert event from Baileys
 */
export async function handleMessagesUpsert({ messages, type }: BaileysEventMap["messages.upsert"]) {
  logger.debug({ messages, type }, "Received messages.upsert event:");

  try {
    await Promise.all(
      messages.map(async (msg) => {
        const messageText = extractMessageText(msg.message);

        if (messageText?.startsWith(env.COMMAND_PREFIX)) {
          const [cmdName, ...args] = parseParams(messageText.slice(1).trim());

          logger.debug(args, `Command detected: ${cmdName} with args:`);

          const cmd = await getCmd(cmdName, { args, message: msg });

          if (cmd) {
            await cmd.handle();
          } else {
            logger.warn({ args }, `Command "${cmdName}" not found.`);
          }
        }
      })
    );
  } catch (error) {
    logger.error(error, "Error handling messages.upsert event:");
  }
}

/**
 * Handles the `contacts.upsert` event from Baileys.
 * @param contacts - The contacts.upsert event from Baileys
 */
export async function handleContactUpsert(contacts: BaileysEventMap["contacts.upsert"]) {
  logger.debug(contacts, "Received contacts.upsert event:");

  try {
    await Promise.all(
      contacts.map(async (contact) => {
        const { id, ...contactWithoutId } = contact;
        const { user, phoneNumber, isGroup } = parseJid(id);

        await upsertContact({
          ...contactWithoutId,
          jid: contact.id,
          lid: isGroup ? user : null,
          phoneNumber,
        });
      })
    );
  } catch (error) {
    logger.error(error, "Error handling contacts.upsert event:");
  }
}

export async function handleGroupsUpsert(groups: BaileysEventMap["groups.upsert"]) {
  logger.debug({ groups }, "Received groups.upsert event:");

  try {
    await Promise.all(
      groups.map(async (group) => {
        // Upsert the group owner contact
        const owner = await upsertContact({
          jid: group.owner,
        });

        // Save all participants
        const res = await Promise.allSettled(
          group.participants.map(async (participant) => {
            await upsertContact({
              lid: participant.id,
              name: participant.name ?? participant.notify,
            });
          })
        );

        if (res.some((r) => r.status === "rejected")) {
          logger.warn({ res, group }, "Some participant upserts failed.");
        }

        const data = {
          name: group.subject,
          jid: group.id,
          memberAddMode: group.memberAddMode ?? true,
          ownerId: owner.id,
        };

        // Upsert the group in the database
        await prisma.group.upsert({
          where: { jid: group.id },
          update: data,
          create: data,
        });
      })
    );
  } catch (error) {
    logger.error(error, "Error handling groups.upsert event:");
  }
}
