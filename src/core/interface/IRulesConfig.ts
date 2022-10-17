import { ErrorTypes, ToggleRule } from './../enums';
import { IRulesAstConfig } from './IRulesAstConfig';

interface IRulesConfig {
    ast: IRulesAstConfig;
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
