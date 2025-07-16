import i18next from "../lib/i18n";
import { sock } from "../lib/connection";
import { CommandConfig, CommandHandler } from "../types";
import { CommandBase, DEFAULT_COMMAND_CONFIG } from "./command-base";
import { logger } from "../lib/logger";

export default class Welcome extends CommandBase {
  protected static config: CommandConfig = {
    ...DEFAULT_COMMAND_CONFIG,
    name: "welcome",
    description: "Sends a welcome message to a new user",
    examples: ["!welcome +1234567890", "!welcome @john"],
  } as const;

  handle: CommandHandler = async () => {
    const {
      key: { remoteJid },
      pushName,
    } = this.context.message;

    if (!remoteJid || !pushName || !this.context.args[0]) {
      logger.error(
        this.context,
        "Cannot send welcome message: remoteJid, pushName, or phone argument missing"
      );
      return;
    }

    const phoneNumber = this.context.args[0].replace(/[^0-9]/g, "");

    // Assert phoneNumber is a valid phone number (at least 8 digits)
    if (phoneNumber.match(/^\d{8,}$/) === null) {
      logger.error(this.context, "Invalid phone number provided");
      return;
    }

    await sock.sendMessage(remoteJid, {
      text: i18next.t("welcome", { phone: `@${phoneNumber}` }),
      mentions: [`${phoneNumber}@s.whatsapp.net`],
    });

    logger.debug(this.context, "Sent welcome message to", remoteJid);
  };
}
