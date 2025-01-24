import path from 'path';

import QRCode from 'qrcode';
import winston from 'winston';

class Logger {
    private static instance: winston.Logger;

    private constructor() {}

    static getInstance(): winston.Logger {
        if (!Logger.instance) {
            Logger.instance = winston.createLogger({
                level: 'debug',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.printf(
                        ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
                    )
                ),
                transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'utils.log' })],
            });
        }
        return Logger.instance;
    }
}

class Utils {
    // The code compiled into the dist/src folder as mentioned in the tsconfig.json file
    public static readonly projectPath: string = path.resolve(path.join(import.meta.dirname, '..', '..'));

    public static readonly logger: winston.Logger = Logger.getInstance();

    static generateQRCode(qrData: string, filePath: string): void {
        try {
            QRCode.toFile(filePath, qrData);
            Utils.logger.info(`QR code saved to ${filePath}`);
            Utils.logger.info('Scan the QR code to authenticate.');
        } catch (error) {
            Utils.logger.error(`Error generating QR code: ${error}`);
        }
    }

    static toNumber(number: string): string {
        if (number.startsWith('0')) {
            number = process.env.COUNTRY_CODE + number.slice(1);
        }
        if (number.includes('@')) {
            number = number.split('@')[0];
        }
        if (number.startsWith('+')) {
            number = number.slice(1);
        }
        return number;
    }

    static toID(id: string, isGroup: boolean): string {
        const end = isGroup ? '@g.us' : '@c.us';
        if (id.startsWith('0')) {
            id = process.env.COUNTRY_CODE + id.slice(1);
        }
        if (id.includes('@')) {
            const parts = id.split('@');
            if (/\d|\+/.test(parts[0])) {
                id = parts[0];
            } else if (parts.length > 1 && /\d|\+/.test(parts[1])) {
                id = parts[1];
            }
        }
        if (!id.endsWith(end)) {
            id += end;
        }
        if (id.startsWith('+')) {
            id = id.slice(1);
        }
        return id;
    }

    static toGID(id: string): string {
        return Utils.toID(id, true);
    }

    static toUID(id: string): string {
        return Utils.toID(id, false);
    }
}

export function add(a: number, b: number): number {
    return a + b;
}

export const toUID = Utils.toUID;
export const toGID = Utils.toGID;
export const toNumber = Utils.toNumber;
export const generateQRCode = Utils.generateQRCode;
export default Utils;
