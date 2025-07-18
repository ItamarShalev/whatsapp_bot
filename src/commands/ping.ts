import { sock } from "../lib/connection";
import { CommandConfig, CommandHandler } from "../types";
import { CommandBase, DEFAULT_COMMAND_CONFIG } from "./command-base";
import { logger } from "../lib/logger";

export default class Ping extends CommandBase {
  protected static config: CommandConfig = {
    ...DEFAULT_COMMAND_CONFIG,
    name: "ping",
    description: "Checks if the bot is online by sending a 'pong' response.",
    examples: ["ping", "p"],
    aliases: ["p"],
  } as const;

  handle: CommandHandler = async () => {
    const { remoteJid } = this.context.message.key;

    if (!remoteJid) {
      logger.error(this.context, "Cannot send ping response: remoteJid missing");
      return;
    }

    await sock.sendMessage(remoteJid, {
      text: "pong!",
    });

    logger.debug(this.context, "Sent ping response to", remoteJid);
  };
}
