import { ErrorTypes, ToggleRule } from './../enums';

interface IRulesConfig {
    emptyKeys: ErrorTypes;
    zombieKeys: ErrorTypes;
    keysOnViews: ErrorTypes;
    misprintKeys: ErrorTypes;
    deepSearch: ToggleRule;
    maxWarning: number;
    misprintCoefficient: number;
    ignoredKeys: string[];
    ignoredMisprintKeys: string[];
    customRegExpToFindKeys: string[] | RegExp[];
}

export { IRulesConfig };
