import { ErrorTypes } from "./../enums";
import { MisprintModel } from '../models';

interface IRulesConfig {
    keysOnViews: ErrorTypes;
    zombieKeys: ErrorTypes;
    misprint: MisprintModel;
}

export { IRulesConfig };
