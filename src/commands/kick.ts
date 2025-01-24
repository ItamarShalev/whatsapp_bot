import Commander from '../commander.js';
import Command from '../command.js';
import type Trigger from '../trigger.js';
import PrefixTrigger from '../triggers/prefix_trigger.js';
import CommandSetting from '../command_setting.js';
import Utils from '../utils.js';
import Event from '../event.js';

class RightCommand extends Command {
    constructor() {
        const setting = new CommandSetting();
        setting.ownerOnly = true;
        setting.adminPrivileges = true;
        super('ping', 'Ping command');
    }
    public override async execute(commander: Commander): Promise<void> {
        let member = commander.msg.body.split(' ')[1];
        if (member !== undefined) {
            member = Utils.toUID(member);
            this.logger.info(`Kicking ${member}`);
            const groupChat = await commander.groupChat();
            groupChat.removeParticipants([member]);
        }
        if (commander.msg.hasQuotedMsg) {
            const quotedMsg = await commander.msg.getQuotedMessage();
            if (quotedMsg !== undefined && quotedMsg.author !== undefined) {
                const groupChat = await commander.groupChat();
                groupChat.removeParticipants([quotedMsg.author]);
            }
        }
    }

    public override triggers(): Trigger[] {
        return [new PrefixTrigger(['kick', 'הוצא'])];
    }

    public override events(): Event[] {
        return [Event.MESSAGE_RECEIVED];
    }
}

export default RightCommand;
