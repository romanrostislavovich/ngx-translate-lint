import { ErrorTypes } from './../enums';
import { IRulesAstConfig } from './IRulesAstConfig';

interface IRulesConfig {
    ast: IRulesAstConfig;
    misprint: ErrorTypes;
    emptyKeys: ErrorTypes;
    zombieKeys: ErrorTypes;
    keysOnViews: ErrorTypes;
    maxWarning: number;
    misprintCoefficient: number;
    ignoredKeys: string[];
    ignoredMisprintKeys: string[];
}

export { IRulesConfig };
