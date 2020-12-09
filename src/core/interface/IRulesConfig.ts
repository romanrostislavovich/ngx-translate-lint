import { ErrorTypes } from './../enums';

interface IRulesConfig {
    misprint: ErrorTypes;
    zombieKeys: ErrorTypes;
    keysOnViews: ErrorTypes;
    maxWarning: number;
    misprintCoefficient: number;
    ignoredKeys: string[];
    ignoredMisprintKeys: string[];
}

export { IRulesConfig };
