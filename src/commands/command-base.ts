import pino from "pino";
import i18next from "../lib/i18n";
import { logger } from "../lib/logger";
import { CommandConfig, CommandContext, CommandHandler, ErrorHandler, Hook } from "../types";
import env from "../lib/env";
/**
 * Default command configuration.
 */
export const DEFAULT_COMMAND_CONFIG: Omit<CommandConfig, "name" | "description" | "examples"> = {
  access: "staff",
} as const;

/**
 * Base class for commands.
 * All commands should extend this class.
 */
export abstract class CommandBase {
  protected static config: CommandConfig = {
    ...DEFAULT_COMMAND_CONFIG,
    name: "",
    description: "Base Command for all other commands.",
    examples: [""],
  };

  protected context: CommandContext;

  // Optional hooks
  before?: Hook;
  after?: Hook;
  onError?: ErrorHandler;

  // Core command logic to be implemented by subclasses
  abstract handle: CommandHandler;

  constructor(args: Pick<CommandContext, "message" | "args">) {
    this.context = {
      ...args,
      payload: {},
      execId: crypto.randomUUID(),
      startedAt: new Date(),
    };
  }

  static commandMap(): Record<
    string,
    (args: Pick<CommandContext, "message" | "args">) => Promise<CommandBase>
  > {
    const config = (this as typeof CommandBase).config;
    const names = [config.name, ...(config.aliases ?? [])];
    const map: Record<string, () => Promise<CommandBase>> = {};
    for (const name of names) {
      // @ts-expect-error `this` can't be CommandBase because it's an abstract class
      map[name] = async (args: Pick<CommandContext, "message" | "args">) => new this(args);
    }
    return map;
  }

  /**
   * Returns the static config for the command.
   */
  getConfig(): CommandConfig {
    return (this.constructor as typeof CommandBase).config;
  }

  /**
   * Executes the command with the provided arguments.
   * @param args Command arguments
   */
  async execute(): Promise<void> {
    const { messageTimestamp } = this.context.message;

    // check permissions
    if (!this.canExecute()) {
      this.logStep("execute", "warn", "Command cannot be executed due to access restrictions");
      return;
    }

    // check timeout
    if (messageTimestamp && Date.now() - +messageTimestamp * 1000 > env.CMD_TIMEOUT) {
      this.logStep("execute", "warn", "Command execution timed out");
      return;
    }

    this.logStep("execute", "info");

    try {
      if (this.before) {
        await this.before();
        this.logStep("before", "trace", "Before hook executed");
      }

      await this.handle();
      this.logStep("handle", "trace", "Command handled successfully");

      if (this.after) {
        await this.after();
        this.logStep("after", "trace", "After hook executed");
      }
    } catch (error) {
      if (this.onError) {
        await this.onError(error as Error);
        this.logStep("onError", "error", "Error handler executed");
      }
      this.logStep("error", "error", `Command execution failed: ${error}`);
    }
  }

  /**
   * Generates a readable message template for the command.
   * @returns A readable message template for the command.
   */
  getTemplateMessage(): string {
    const payload = this.generateReadable();

    // return by `options.templateName` if exists
    const config = this.getConfig();
    if (config.templateName && i18next.exists(config.templateName)) {
      return i18next.t(config.templateName, payload);
    }

    // otherwise, return by `config.name`
    if (i18next.exists(config.name)) {
      return i18next.t(config.name, payload);
    }

    if (config.name || config.templateName) {
      logger.warn(
        {
          command: config.name,
        },
        `template "${config.name || config.templateName}" not found.`
      );
    }

    // finally return the keys of the payload
    return Object.keys(payload).join("\n");
  }

  getSender(): string {
    const { key } = this.context.message;
    const remoteJid = key.remoteJid || key.participant;

    if (!remoteJid) {
      return i18next.t("unknown");
    }

    // If the remoteJid is a group, return the group name
    if (remoteJid.endsWith("@g.us")) {
      return remoteJid;
    }

    // Otherwise, return the phone number
    return remoteJid;
  }

  /**
   * Checks if the command can be executed based on the access level.
   * @returns Whether the command can be executed based on the access level.
   */
  canExecute(): boolean {
    const config = this.getConfig();
    const sender = this.getSender();

    // allow execution if the access level is "user" or if the sender is the admin
    if (config.access === "user" || sender === env.ADMIN_PHONE_NUMBER) {
      return true;
    }

    // TODO: handle `staff` access

    return true;
  }

  logStep(step: string, level: pino.Level, message?: string): void {
    const config = this.getConfig();
    logger[level](
      {
        context: this.context,
        command: config.name,
        step,
      },
      message
    );
  }

  /**
   *  Generate a readable version of a record object.
   * @param record - The record object to convert.
   * @returns A new object with readable string values.
   */
  generateReadable(): Record<string, string> {
    const readable: Record<string, string> = {};
    for (const key in this.context.payload) {
      if (Object.prototype.hasOwnProperty.call(this.context.payload, key)) {
        const value = this.context.payload[key];

        if (typeof value === "string") {
          readable[key] = value;
        } else if (typeof value === "number") {
          readable[key] = value.toFixed(3);
        } else if (typeof value === "boolean") {
          readable[key] = i18next.t(value ? "Yes" : "No");
        } else if (Array.isArray(value)) {
          readable[key] = value.join("\n");
        } else if (value instanceof Date) {
          readable[key] = value.toLocaleDateString(env.LANGUAGE);
        } else if (value && typeof value === "object") {
          readable[key] = JSON.stringify(value);
        } else {
          readable[key] = "";
        }
      }
    }

    return readable;
  }
}
