import dotenv from 'dotenv';
import { toGID, toUID } from './utils.js';

class Config {
    private requiredEnvVars: string[] = ['OWNER', 'COUNTRY_CODE'];
    private optionalEnvVars: string[] = ['COMMAND_PREFIX', 'ONWER_ONLY', 'DEVELOPMENT_GROUP_ID'];
    private static instance: Config;
    private static DEFAULT_COMMAND_PREFIX: string = '!';

    public readonly owner: string;
    public readonly countryCode: string;
    public readonly commandPrefix: string;
    public ownerOnly: boolean;
    public readonly hasDevelopmentGroupId: boolean;
    public readonly developmentGroupId: string;

    private constructor() {
        dotenv.config();
        this.checkRequiredEnvVars();
        this.countryCode = process.env.COUNTRY_CODE as string;
        this.commandPrefix = process.env.COMMAND_PREFIX || Config.DEFAULT_COMMAND_PREFIX;
        this.owner = toUID(process.env.OWNER as string);
        this.ownerOnly = (process.env.OWNER_ONLY || '').toLowerCase() == 'true' || false;
        this.developmentGroupId = process.env.DEVELOPMENT_GROUP_ID || '';
        this.hasDevelopmentGroupId = this.developmentGroupId.length > 0;
        this.developmentGroupId = toGID(this.developmentGroupId);
    }

    public static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    private checkRequiredEnvVars(): void {
        this.requiredEnvVars.forEach((envVar) => {
            if (!process.env[envVar]) {
                throw new Error(`Missing required environment variable: ${envVar}`);
            }
        });
    }
}

export default Config;
