import Commander from '../commander.js';
import Trigger from '../trigger.js';

class AlwaysTrigger extends Trigger {
    public check(_commander: Commander): boolean {
        return true;
    }
}

export default AlwaysTrigger;
