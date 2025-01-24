import Commander from '../commander.js';
import Command from '../command.js';
import type Trigger from '../trigger.js';
import ContainsTrigger from '../triggers/contains_trigger.js';
import Event from '../event.js';

class RightCommand extends Command {
    constructor() {
        super('Right', 'Right command');
    }

    public override async execute(commander: Commander): Promise<void> {
        const responses = ['נכון !', 'אמת !', 'לגמרי !'];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        commander.msg.reply(randomResponse);
    }

    public override triggers(): Trigger[] {
        return [new ContainsTrigger(['נכון ?', 'נכון?'])];
    }

    public override events(): Event[] {
        return [Event.MESSAGE_RECEIVED];
    }
}

export default RightCommand;
