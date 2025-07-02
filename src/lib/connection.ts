import * as Baileys from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { logger } from "./logger";
import env from "./env";

declare namespace global {
  var _sock: Baileys.WASocket | undefined;
}

const { saveCreds, state } = await Baileys.useMultiFileAuthState(env.SESSION_PATH);

function getSock(): Baileys.WASocket {
  if (!global._sock) {
    logger.debug("Creating new Baileys socket...");
    global._sock = Baileys.makeWASocket({
      auth: state,
      logger,
    });
  }

  return global._sock;
}

export const sock = getSock();

export function startSock(setup: (sock: Baileys.WASocket) => void): void {
  const sock = getSock();

  sock.ev.on("creds.update", saveCreds);

  // Setup built-in event handlers
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      logger.info("Connection established successfully.");
      setup(sock);
    }

    if (connection === "connecting") {
      logger.info("Connecting to WhatsApp...");
    }

    if (connection === "close") {
      logger.warn("Connection closed.");
      const reason = (lastDisconnect?.error as Boom).output?.statusCode;

      if (reason === Baileys.DisconnectReason.loggedOut) {
        logger.error("Logged out. Please delete session and restart.");
        process.exit(1);
      }

      if (reason === Baileys.DisconnectReason.restartRequired) {
        logger.info("Restart required. Reconnecting...");
        global._sock = undefined;
        startSock(setup); // Recursively restart
      }
    }
  });
}
