import { z } from "zod";
import { deltaTimeToMs, getZodCliErrorMessage } from "./utils";

/**
 * default values and app variables
 */
const appVariables = {
  LANGUAGES_AVAILABLE: ["en", "he", "fr"],
} as const;

/**
 * Enviroment variables schema validation.
 */
const envSchema = z.object({
  LANGUAGE: z.enum(appVariables.LANGUAGES_AVAILABLE).default("en"),
  COMMAND_PREFIX: z.string().max(1).min(1).default("!"),
  ADMIN_PHONE_NUMBER: z.string().regex(/^\+[1-9]\d{1,14}$/, "Invalid E.164 phone number format"),
  LOG_FILE: z.string().default("logs/bot.log"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "verbose", "debug", "silly"]).default("info"),
  SESSION_PATH: z.string().default("session"),
  CMD_TIMEOUT: z
    .string()
    .regex(/^\d+(ms|s|m)$/, "Invalid timeout format. Must be `{number}{ms | s | m}`")
    .transform((val) => deltaTimeToMs(val as `${number}${"ms" | "s" | "m"}`))
    .default("30s"),
  DATABASE_URL: z.string().url().default("file:../data/database.sqlite"),
});

const { success, data, error } = envSchema.safeParse(process.env);

if (!success) {
  console.error("❌ Invalid environment variables:\n", getZodCliErrorMessage(error));
  process.exit(1);
}

export default { ...data, ...appVariables } as z.infer<typeof envSchema> & typeof appVariables;
