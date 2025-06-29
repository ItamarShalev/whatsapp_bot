import fs from "fs";
import path from "path";
import { CommandCtorArgs } from "../types";
import { CommandBase } from "../commands/command-base";
import { logger } from "./logger";

type CommandMap = Record<string, (args: CommandCtorArgs) => Promise<CommandBase>>;

declare namespace global {
  var commands: CommandMap | undefined;
}

const commands: CommandMap = global.commands || (await loadCommands());

if (!global.commands) {
  global.commands = commands;
}

/**
 * Dynamically loads all command classes from the commands directory.
 * @returns A map of command names to command constructors
 */
async function loadCommands(): Promise<CommandMap> {
  let commands: CommandMap = {};

  const commandDir = path.resolve(process.cwd(), "src", "commands");
  const files = fs.readdirSync(commandDir);

  for (const file of files) {
    if (file.endsWith(".ts") && file !== "command-base.ts") {
      const CommandClass = (await import(path.join(commandDir, file))).default;

      if (CommandClass && CommandClass.prototype instanceof CommandBase) {
        const commandMap = CommandClass.commandMap();
        commands = { ...commands, ...commandMap };
      } else {
        logger.error(
          `Command class in ${file} does not extend CommandBase or is not a valid command`
        );
      }
    }
  }

  return commands;
}

/**
 * Resolves a command by its name.
 * @param cmdName - The name of the command to retrieve
 * @returns A promise that resolves to the command instance or null if not found
 */
export async function getCmd(
  cmdName: string = "",
  args: CommandCtorArgs
): Promise<CommandBase | null> {
  cmdName = cmdName.toLowerCase();

  if (cmdName in commands) {
    return commands[cmdName](args);
  }

  return null;
}
