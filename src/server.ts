import fs from 'fs';
import path from 'path';
import winston from 'winston';

import pkg, { Message } from 'whatsapp-web.js';
const { LocalAuth } = pkg;
import { Client } from 'whatsapp-web.js';

import Utils from './utils.js';
import Config from './config.js';
import Command from './command.js';
import Event from './event.js';
import Commander from './commander.js';

class WhatsAppBot {
    private client: Client;
    private config: Config;
    private commands: Command[];
    private logger: winston.Logger;

    constructor() {
        this.logger = Utils.logger;
        this.config = Config.getInstance();
        this.client = this.createClient();
        this.commands = [];
    }

    private createClient(): Client {
        return new Client({
            authStrategy: new LocalAuth({
                dataPath: path.join(Utils.projectPath, 'session_data'),
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        });
    }

    private async initializeEventHandlers(): Promise<void> {
        this.client.on('qr', async (qr: string) => {
            const filePath = path.join(Utils.projectPath, 'qr', 'qr_code.png');
            Utils.generateQRCode(qr, filePath);
        });

        this.client.on('authenticated', () => {
            this.logger.info('Client authenticated');
        });

        this.client.on('ready', async () => {
            this.logger.info('Client is ready!');
            if (this.config.hasDevelopmentGroupId) {
                await this.client.sendMessage(this.config.developmentGroupId, 'הקוד מעודכן והכל מוכן.');
            }
        });

        this.client.on(Event.MESSAGE_RECEIVED, async (msg: Message) => {
            const commander = new Commander(this.client, msg);
            Command.run(Event.MESSAGE_RECEIVED, commander, this.commands);
        });

        this.client.on('auth_failure', () => {
            this.logger.info('Authentication failed');
        });

        this.client.on('disconnected', (reason: string) => {
            this.logger.info(`Client disconnected: ${reason}`);
        });

        this.client.on('error', (error: Error) => {
            this.logger.error(`Error: ${error}`);
        });

        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
        });
    }

    private async createAllCommands(): Promise<Command[]> {
        const commands: Command[] = [];
        const files = fs.readdirSync(path.join(import.meta.dirname, 'commands'));

        for (const file of files) {
            const fullPath = path.join(import.meta.dirname, 'commands', file);

            if (file.endsWith('.js')) {
                const module = await import(fullPath);

                if (module.default) {
                    const commandInstance = new module.default();
                    if (!commandInstance.setting.active) {
                        continue;
                    }
                    commands.push(commandInstance);
                }
            }
        }

        return commands;
    }

    public async start(): Promise<void> {
        this.commands = await this.createAllCommands();
        this.logger.info(`Commands loaded: ${this.commands.map((command) => command.name).join(', ')}`);
        await this.initializeEventHandlers();
        this.client.initialize();
    }
}

function main(): void {
    const bot = new WhatsAppBot();
    bot.start();
}

main();
