import "dotenv/config";
import path from "path";
import fs from "fs";
import { CommandBase } from "../../src/commands/command-base";
import i18n from "../../src/lib/i18n";
import env from "../../src/lib/env";

describe("Commands Config i18n Test", () => {
  const commmands: (typeof CommandBase)[] = [];

  beforeAll(async () => {
    // Load all commands
    const commandDir = path.resolve(process.cwd(), "src", "commands");
    const files = fs.readdirSync(commandDir);

    for (const file of files) {
      if (file.endsWith(".ts") && file !== "command-base.ts") {
        const CommandClass = (await import(path.join(commandDir, file))).default;

        if (CommandClass && CommandClass.prototype instanceof CommandBase) {
          commmands.push(CommandClass);
        }
      }
    }
  });

  it("should have translations for all readable keys in config", () => {
    for (const CommandClass of commmands) {
      // @ts-ignore Accessing static config property
      const { description, name, aliases, examples } = CommandClass.config;

      env.LANGUAGES_AVAILABLE.forEach((lang) => {
        i18n.changeLanguage(lang);

        expect(i18n.exists(name)).toBe(true);
        expect(i18n.exists(description)).toBe(true);

        examples.forEach((example) => {
          expect(i18n.exists(example)).toBe(true);
        });

        aliases?.forEach((alias) => {
          expect(i18n.exists(alias)).toBe(true);
        });
      });
    }
  });
});
