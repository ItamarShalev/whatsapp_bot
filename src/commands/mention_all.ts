import Commander from '../commander.js';
import CommandSetting from '../command_setting.js';
import Command from '../command.js';
import PrefixTrigger from '../triggers/prefix_trigger.js';
import type Trigger from '../trigger.js';
import Event from '../event.js';

class MentionAllCommand extends Command {
    constructor() {
        const setting = new CommandSetting();
        setting.onGroupChat = true;
        super('mention_all', 'Mention all command', setting);
    }

    public override async execute(commander: Commander): Promise<void> {
        const groupChat = await commander.groupChat();
        const msg = commander.msg;
        const excludeNumbers = [this.config.owner, await commander.myId()];

        const participants = groupChat.participants
            .filter((participant) => !excludeNumbers.includes(participant.id._serialized))
            .map((participant) => participant.id._serialized);

        const hebPart = 'הודעה חשובה שימו לב !';
        const message =
            `*${hebPart}* \n\n` + participants.map((participant) => `@${participant.split('@')[0]}`).join('\n');

        if (participants.length == 0) {
            await msg.reply('אין משתתפים חוץ ממני וממנך');
            return;
        }

        if (msg.hasQuotedMsg) {
            try {
                const quotedMsg = await msg.getQuotedMessage();
                await groupChat.sendMessage(message, {
                    mentions: participants,
                    quotedMessageId: quotedMsg.id._serialized,
                });
                return;
            } catch {}
        }
        groupChat.sendMessage(message, {
            mentions: participants,
            quotedMessageId: msg.id._serialized,
        });
    }

    public override triggers(): Trigger[] {
        return [new PrefixTrigger(['all', 'כולם'])];
    }

    public override events(): Event[] {
        return [Event.MESSAGE_RECEIVED];
    }
}

export default MentionAllCommand;
