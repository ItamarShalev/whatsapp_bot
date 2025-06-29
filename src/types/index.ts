import { proto } from "@whiskeysockets/baileys";

export type CommandConfig = {
  name: string;
  templateName?: string;
  description: string;
  examples: [string, ...string[]];
  aliases?: string[];
  access: "admin" | "staff" | "manager" | "user";
};

export type CommandContext = {
  payload: Record<string, unknown>;
  execId: string;
  startedAt: Date;
  message: proto.IWebMessageInfo;
  args: string[];
};

export type CommandCtorArgs = Pick<CommandContext, "message" | "args">;

export type Hook = () => Promise<void> | void;
export type ErrorHandler = (error: Error) => Promise<void> | void;
export type CommandHandler = () => Promise<void> | void;
