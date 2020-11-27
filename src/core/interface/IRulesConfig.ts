import { ErrorTypes } from './../enums';

interface IAstRulesConfig {
    ngxTranslateService?: ErrorTypes;
    isNgxTranslateLintImported?: ErrorTypes;
}

interface IRulesConfig {
    misprint: ErrorTypes;
    zombieKeys: ErrorTypes;
    keysOnViews: ErrorTypes;
    maxWarning: number;
    misprintCoefficient: number;
    ast?: IAstRulesConfig;
    ignoredKeys: string[];
}

export { IRulesConfig, IAstRulesConfig };
