import Commander from '../commander.js';
import Command from '../command.js';
import type Trigger from '../trigger.js';
import ContainsTrigger from '../triggers/contains_trigger.js';
import Utils from '../utils.js';
import CommandSetting from '../command_setting.js';
import Event from '../event.js';

class ItamarCommand extends Command {
    constructor() {
        const setting = new CommandSetting();
        setting.active = false;
        super('ping', 'Ping command', setting);
    }
    public override async execute(commander: Commander): Promise<void> {
        const owner = Utils.toNumber(this.config.owner);
        const msg = commander.msg;
        const groupChat = await commander.groupChat();
        let message = `@${owner}\n`;
        message += `מר מנהל, מישהו הזכיר אותך, נא לבדוק שלא צריכים אותך ברמה דחופה.`;
        groupChat.sendMessage(message, {
            mentions: [this.config.owner],
            quotedMessageId: msg.id._serialized,
        });
    }

    public override triggers(): Trigger[] {
        return [new ContainsTrigger(['איתמר'])];
    }

    public override events(): Event[] {
        return [Event.MESSAGE_RECEIVED];
    }
}

export default ItamarCommand;
