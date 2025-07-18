import { sock } from "../lib/connection";
import { CommandConfig, CommandHandler } from "../types";
import { CommandBase, DEFAULT_COMMAND_CONFIG } from "./command-base";
import { logger } from "../lib/logger";
import z from "zod";

export default class Poll extends CommandBase {
  protected static config: CommandConfig = {
    ...DEFAULT_COMMAND_CONFIG,
    description: "Create and send a poll with multiple options",
    examples: [`!poll "What's your favorite color?" "Red" "Blue" "Green"`],
    name: "poll",
  } as const;

  handle: CommandHandler = async () => {
    try {
      const { remoteJid, name, values } = z
        .object({
          remoteJid: z.string(),
          name: z.string().min(1, "Poll name is required"),
          values: z.array(z.string()).min(2, "At least two options are required for a poll"),
        })
        .parse({
          remoteJid: this.context.message.key.remoteJid,
          name: this.context.args[0],
          values: this.context.args.slice(1),
        });

      await sock.sendMessage(remoteJid, {
        poll: {
          name,
          values,
          selectableCount: 1,
        },
      });

      logger.debug(this.context, "Created and sent poll to", remoteJid);
    } catch (error) {
      logger.error({ ctx: this.context, err: error }, "Failed to create poll:");
    }
  };
}
