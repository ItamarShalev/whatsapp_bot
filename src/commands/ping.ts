import { sock } from "../lib/connection";
import { CommandConfig, CommandContext, CommandHandler } from "../types";
import { CommandBase, DEFAULT_COMMAND_CONFIG } from "./command-base";
import { logger } from "../lib/logger";

export class Ping extends CommandBase {
  static config: CommandConfig = {
    ...DEFAULT_COMMAND_CONFIG,
    name: "ping",
  } as const;

  constructor(args: Pick<CommandContext, "message" | "args">) {
    super(args);
  }

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
