import Commander from '../commander.js';
import Command from '../command.js';
import type Trigger from '../trigger.js';
import PrefixTrigger from '../triggers/prefix_trigger.js';
import Event from '../event.js';

class PingCommand extends Command {
    constructor() {
        super('ping', 'Ping command');
    }
    public override async execute(commander: Commander): Promise<void> {
        commander.msg.reply('Pong!');
    }

    public override triggers(): Trigger[] {
        return [new PrefixTrigger(['ping', 'פינג'])];
    }

    public override events(): Event[] {
        return [Event.MESSAGE_RECEIVED];
    }
}

export default PingCommand;
