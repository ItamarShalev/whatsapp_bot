import fs from "fs";
import path from "path";
import { z } from "zod";
import { FullJid, jidDecode, proto } from "@whiskeysockets/baileys";

/**
 * Converts a time string in the format of "10ms", "5s", or "2m" to milliseconds.
 * @param timeStr - The time string to convert, which should be in the format of `${number}${"ms" | "s" | "m"}`.
 * @returns The time in milliseconds.
 */
export function deltaTimeToMs(timeStr: `${number}${"ms" | "s" | "m"}`): number {
  const match = timeStr.match(/^(\d+)(ms|s|m)$/);
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  const [, valueStr, unit] = match;
  const value = parseInt(valueStr, 10);

  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    default:
      throw new Error(`Invalid time format: ${timeStr}`);
  }
}

/**
 *  Loads markdown templates for a specific language from the templates directory.
 * @param lang - The language for which to load templates (e.g., "en", "fr").
 * @returns A record where keys are template names and values are the markdown content.
 */
export function loadMarkdownTemplatesForLang(lang: string): Record<string, string> {
  const templatesDir = path.join(process.cwd(), "templates", lang);

  if (!fs.existsSync(templatesDir)) {
    throw new Error(`Templates directory for language "${lang}" does not exist.`);
  }

  const files = fs.readdirSync(templatesDir);
  const templates: Record<string, string> = {};

  files.forEach((file) => {
    if (file.endsWith(".md")) {
      const filePath = path.join(templatesDir, file);
      const content = fs.readFileSync(filePath, "utf8");
      const key = path.basename(file, ".md");
      templates[key] = content;
    }
  });

  return templates;
}

/**
 * Get a formatted error message from a Zod validation error.
 * @param error - The ZodError object containing validation errors.
 * @returns A string with formatted error messages for each field.
 */
export function getZodCliErrorMessage(error: z.ZodError): string {
  return Object.entries(error.flatten().fieldErrors)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join("\n");
}

/**
 * Parses a string of parameters, preserving quoted strings as single elements.
 * @param rawParams - A string containing parameters, which may include quoted strings.
 * @returns An array of parameters, with quoted strings preserved as single elements.
 */
export function parseParams(rawParams: string): string[] {
  // Split the rawParams by spaces, but keep quoted strings together
  const regex = /"([^"]+)"|(\S+)/g;
  const params: string[] = [];
  let match;

  while ((match = regex.exec(rawParams)) !== null) {
    // If the first capturing group is not null, it means we found a quoted string
    if (match[1]) {
      params.push(match[1]);
    } else if (match[2]) {
      params.push(match[2]);
    }
  }

  return params;
}

/**
 * Parses a JID (Jabber ID) string into its components.
 * @param jid - The JID (Jabber ID) string to parse.
 * @returns An object containing parsed components of the JID, including user, server, device, whether it's a group, and the phone number.
 */
export function parseJid(
  jid: string
): Partial<FullJid> & { isGroup: boolean; phoneNumber: string | null } {
  const decoded = jidDecode(jid);

  return {
    user: decoded?.user,
    server: decoded?.server,
    device: decoded?.device,
    isGroup: decoded?.server === "g.us",
    phoneNumber: decoded?.user ? `+${decoded.user}` : null,
  };
}

/**
 * Extracts relevant message text from a Baileys message object.
 * @param message The Baileys message proto object.
 * @returns The extracted message text.
 */
export function extractMessageText(message: proto.IMessage | null | undefined): string | null {
  if (!message) return null;

  if (message.conversation) {
    return message.conversation;
  }
  if (message.extendedTextMessage?.text) {
    return message.extendedTextMessage.text;
  }
  if (message.imageMessage?.caption) {
    return message.imageMessage.caption;
  }
  if (message.videoMessage?.caption) {
    return message.videoMessage.caption;
  }
  if (message.pollCreationMessage?.name) {
    return message.pollCreationMessage.name; // Poll question
  }
  // Add more message types as needed
  return null;
}
