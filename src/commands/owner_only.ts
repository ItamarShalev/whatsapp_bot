import Commander from '../commander.js';
import Command from '../command.js';
import type Trigger from '../trigger.js';
import CommandSetting from '../command_setting.js';
import PrefixTrigger from '../triggers/prefix_trigger.js';
import Event from '../event.js';

class OwnerOnlyCommand extends Command {
    constructor() {
        const setting = new CommandSetting();
        setting.active = true;
        setting.ownerOnly = true;
        super('ping', 'Ping command', setting);
    }
    public override async execute(commander: Commander): Promise<void> {
        const args = commander.msg.body.toLowerCase().split(' ');
        if (args.length < 2 || args.includes('on') || args.includes('הפעל')) {
            this.config.ownerOnly = true;
            commander.msg?.reply('מעכשיו אגיב לבעלים בלבד.');
            return;
        } else if (args.includes('off') || args.includes('כבה')) {
            this.config.ownerOnly = false;
            commander.msg?.reply('מעכשיו אגיב לכולם.');
            return;
        }
    }

    public override triggers(): Trigger[] {
        return [new PrefixTrigger(['בעלים', 'owner', 'owner only', '!owner_only'], false)];
    }

    public override events(): Event[] {
        return [Event.MESSAGE_RECEIVED];
    }
}

export default OwnerOnlyCommand;
