import pino, { LoggerOptions } from "pino";
import fs from "fs";
import env from "./env";

/**
 * Logger configuration for development
 */
const devConfig: LoggerOptions = {
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname,host",
    },
  },
} as const;

/**
 * Logger configuration for production
 */
const prodConfig: LoggerOptions = {
  level: env.LOG_LEVEL,
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: ["host"],
} as const;

// Ensure the log file exists before creating the write stream
let logStream: fs.WriteStream | undefined = undefined;
if (env.LOG_FILE) {
  const logDir = env.LOG_FILE.substring(0, env.LOG_FILE.lastIndexOf("/"));

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  if (!fs.existsSync(env.LOG_FILE)) {
    fs.closeSync(fs.openSync(env.LOG_FILE, "a"));
  }

  logStream = fs.createWriteStream(env.LOG_FILE, { flags: "a" });
}

export const logger = pino(
  process.env.NODE_ENV === "development" ? devConfig : prodConfig,
  logStream
);
