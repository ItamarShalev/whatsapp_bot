import Commander from '../commander.js';
import Command from '../command.js';
import type Trigger from '../trigger.js';
import PrefixTrigger from '../triggers/prefix_trigger.js';
import ContainsTrigger from '../triggers/contains_trigger.js';
import CommandSetting from '../command_setting.js';
import Event from '../event.js';

class ExamPeriodCommand extends Command {
    targetDate: Date;

    constructor() {
        const setting = new CommandSetting();
        setting.active = false;
        super('Exam Period', 'Exam Period command', setting);

        this.targetDate = new Date('2025-02-05');
    }

    private daysUntilDate(targetDate: Date): number {
        const today = new Date();
        const timeDifference = targetDate.getTime() - today.getTime();
        const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
        return daysDifference;
    }

    public override async execute(commander: Commander): Promise<void> {
        commander.msg.reply(`עוד ${this.daysUntilDate(this.targetDate)} ימים עד לתקופת המבחנים ! לחץץץץץץץץ`);
    }

    public override triggers(): Trigger[] {
        return [
            new PrefixTrigger(['תקופת מבחנים', '!תקופת מבחנים', 'מבחנים', '!מבחנים'], false),
            new ContainsTrigger(['תקופת מבחנים', 'מבחנים']),
        ];
    }

    public override events(): Event[] {
        return [Event.MESSAGE_RECEIVED];
    }
}

export default ExamPeriodCommand;
