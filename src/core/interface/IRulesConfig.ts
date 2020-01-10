import { IMisprint } from './../interface/IMisprint';
import { ErrorTypes } from './../enums';

interface IRulesConfig {
    keysOnViews: ErrorTypes;
    zombieKeys: ErrorTypes;
    misprint: IMisprint;
}

export { IRulesConfig };
