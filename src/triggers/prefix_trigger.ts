import Commander from '../commander.js';
import Trigger from '../trigger.js';
import Config from '../config.js';

class PrefixTrigger extends Trigger {
    private prefixes: string[];

    constructor(prefixes: string[], bothSingedUnsigned: boolean = true) {
        super();
        this.prefixes = [];
        const commandPrefix = Config.getInstance().commandPrefix;
        if (bothSingedUnsigned) {
            this.prefixes = prefixes.map((prefix) => prefix.toLowerCase());
        }
        for (const prefix of prefixes) {
            this.prefixes.push(commandPrefix + prefix.toLowerCase());
        }
    }

    public check(commander: Commander): boolean {
        const message = commander.msg.body.toLowerCase();
        return this.prefixes.some((prefix) => message.startsWith(prefix));
    }
}

export default PrefixTrigger;
