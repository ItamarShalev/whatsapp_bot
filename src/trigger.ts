import type Commander from './commander.js';

abstract class Trigger {
    abstract check(commander: Commander): boolean;
}

export default Trigger;
