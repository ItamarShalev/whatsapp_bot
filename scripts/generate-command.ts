import { z } from "zod";
import { getZodCliErrorMessage } from "../src/lib/utils";
import fs from "fs";
import path from "path";
import env from "../src/lib/env";

const optionsSchema = z.object({
  name: z
    .string()
    .regex(
      /^[A-Za-z][A-Za-z0-9]*$/,
      "Must start with ASCII letter and continue with alphanumeric characters"
    ),
  description: z.string().optional(),
});

const options = optionsSchema.safeParse({
  name: process.argv[2],
  description: process.argv[3],
});

if (!options.success) {
  console.error("❌ Invalid options:");
  console.error(getZodCliErrorMessage(options.error));
  process.exit(1);
}

const { name, description } = options.data;

const cababCase = name
  .replace(/([a-z])([A-Z])/g, "$1-$2")
  .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
  .toLowerCase();

const pascalCase = name.replace(/(^\w|-\w)/g, (match) => match.replace("-", "").toUpperCase());

const commendFilePath = path.join(process.cwd(), "src", "commands", `${cababCase}.ts`);

if (fs.existsSync(commendFilePath)) {
  console.error(`❌ Command file "${cababCase}.ts" already exists.`);
  process.exit(1);
}

const anyTemplateExists = env.LANGUAGES_AVAILABLE.some((lang) => {
  const templatePath = path.join(process.cwd(), "src", "commands", "templates", `${lang}.ts`);
  return fs.existsSync(templatePath);
});

if (anyTemplateExists) {
  console.error(
    "❌ Command templates already exist. Please remove them before generating a new command."
  );
  process.exit(1);
}

const commandTemplate = `import i18next from "../i18n";
import { sock } from "../connection";
import { CommandConfig, CommandContext, CommandHandler } from "../types";
import { CommandBase, DEFAULT_COMMAND_CONFIG } from "./command-base";

export default class ${pascalCase} extends CommandBase {
  static config: CommandConfig = {
    ...DEFAULT_COMMAND_CONFIG,
    name: "${cababCase}",
    description: "${description || `Description for ${cababCase} command`}",
    examples: ["!${cababCase}", "!${cababCase} arg1 arg2"
  } as const;

  constructor(args: Pick<CommandContext, "message" | "args">) {
    super(args);
  }

  handle: CommandHandler = async () => {
    await sock.sendMessage(remoteJid, {
      text: i18next.t("${cababCase}", { }),
    });
  };
}
`;

fs.writeFileSync(commendFilePath, commandTemplate, { encoding: "utf8" });
console.log(`✅ Command file "${cababCase}.ts" created successfully.`);

env.LANGUAGES_AVAILABLE.forEach((lang) => {
  const templatePath = path.join(process.cwd(), "templates", lang, `${cababCase}.md`);
  const templateContent = `Hello in ${lang}!`;
  fs.writeFileSync(templatePath, templateContent, { encoding: "utf8" });
  console.log(`✅ Template file "${cababCase}.md" created successfully in "${lang}" language.`);
});

console.log("✅ All command templates created successfully.");
