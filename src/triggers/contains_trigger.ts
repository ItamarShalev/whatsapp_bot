import Commander from '../commander.js';
import Trigger from '../trigger.js';

class ContainsTrigger extends Trigger {
    private stings: string[];

    constructor(stings: string[]) {
        super();
        this.stings = stings.map((sting) => sting.toLowerCase());
    }

    public check(commander: Commander): boolean {
        const message = commander.msg.body.toLowerCase();
        return this.stings.some((sting) => message.includes(sting));
    }
}

export default ContainsTrigger;
