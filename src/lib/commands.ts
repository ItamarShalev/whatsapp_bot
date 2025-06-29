import { Poll } from "../commands/poll";
import { Ping } from "../commands/ping";
import { Welcome } from "../commands/welcome";
import { CommandCtorArgs } from "../types";
import { CommandBase } from "../commands/command-base";

/**
 * A registry for commands, mapping command names to their respective command instances.
 * This allows dynamic loading and execution of commands based on user input.
 */
const commands: Record<string, (args: CommandCtorArgs) => Promise<CommandBase>> = {
  ...Welcome.commandMap(),
  ...Poll.commandMap(),
  ...Ping.commandMap(),
} as const;

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
