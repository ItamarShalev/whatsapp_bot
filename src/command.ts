import winston from 'winston';

import Config from './config.js';
import Commander from './commander.js';
import CommandSetting from './command_setting.js';
import Utils from './utils.js';
import type Trigger from './trigger.js';
import Event from './event.js';

abstract class Command {
    config: Config;
    name: string;
    description: string;
    setting: CommandSetting;
    logger: winston.Logger;

    constructor(name: string, description: string, setting: CommandSetting | null = null) {
        this.logger = Utils.logger;
        this.config = Config.getInstance();
        this.name = name;
        this.description = description;
        this.setting = setting || new CommandSetting();
        if (!name || !description) {
            throw new Error('Command name and description are required');
        }
    }

    private static async correctTriggerMessageReceived(commander: Commander, command: Command): Promise<boolean> {
        const logger: winston.Logger = Utils.logger;
        const correctTrigger = command.triggers().some((trigger) => trigger.check(commander));
        if (!correctTrigger) {
            return false;
        }
        const correctAccess =
            (!command.setting.adminOnly || (await commander.authorIsAdmin())) &&
            (!command.setting.ownerOnly || commander.authorIsOwner());
        if (!correctAccess) {
            logger.debug('Access denied, author is not admin or owner');
            return false;
        }
        const isGroupChat = await commander.groupChat();

        if (!command.setting.onPrivateChat || !command.setting.onGroupChat) {
            if (command.setting.onGroupChat && !isGroupChat) {
                logger.debug('Command is only for group chat');
                return false;
            }

            if (command.setting.onPrivateChat && isGroupChat) {
                logger.debug('Command is only for private chat');
                return false;
            }
        }

        if (command.setting.adminPrivileges && !(await commander.botIsAdmin())) {
            logger.debug('Command requires admin privileges');
            return false;
        }
        return true;
    }

    private static async corretTriggerForEvent(event: Event, commander: Commander, command: Command): Promise<boolean> {
        if (event === Event.MESSAGE_RECEIVED) {
            return await Command.correctTriggerMessageReceived(commander, command);
        }
        return false;
    }

    static async run(event: Event, commander: Commander, commands: Command[]): Promise<void> {
        const logger: winston.Logger = Utils.logger;
        const config = Config.getInstance();

        logger.info(`Received event: ${event}`);

        if (commander.msg) {
            logger.info(`Received message: ${commander.msg.body}`);
            logger.info(`Received message lowercase: ${commander.msg.body.toLowerCase()}`);

            if (commander.msg.fromMe) {
                logger.debug('Message is from me');
                return;
            }

            if (config.ownerOnly && (commander.msg.author || commander.msg.from) != config.owner) {
                logger.debug('Message is not from the owner');
                return;
            }
        }

        for (const command of commands) {
            const correctEvent = command.events().includes(event);
            if (!correctEvent) {
                logger.debug(`Command ${command.name} does not listen to event ${event}`);
                continue;
            }

            if (!(await Command.corretTriggerForEvent(event, commander, command))) {
                logger.debug(`Command ${command.name} does not have correct trigger for event ${event}`);
                continue;
            }

            try {
                command.initialize(commander);
                command.execute(commander);
            } catch (e) {
                logger.error(e);
            }
        }
    }

    /**
     * Initialize the command.
     *
     * @param {commander} commander The Commander instance to help achive common functionallity.
     */
    public initialize(_commander: Commander): void {}

    /**
     * Execute the command.
     *
     * @param {commander} commander The Commander instance to help achive common functionallity.
     */
    abstract execute(helper: Commander): void;

    /**
     * Return all the triggers the commands start from.
     *
     * @returns {Trigger[]} An array of triggers.
     */
    abstract triggers(): Trigger[];

    /**
     * Return all the events the command listens to.
     *
     * @returns {events[]} An array of events.
     */
    abstract events(): Event[];
}

export default Command;
