import { ErrorTypes, ToggleRule } from './enums';
import { IAppConfig } from './interface';

const config: IAppConfig = {
    defaultValues: {
        rules: {
            ast: {
              isNgxTranslateImported: ErrorTypes.error,
            },
            zombieKeys: ErrorTypes.warning,
            keysOnViews: ErrorTypes.error,
            emptyKeys: ErrorTypes.warning,
            deepSearch: ToggleRule.disable,
            misprintKeys: ErrorTypes.disable,
            maxWarning: 0,
            misprintCoefficient: 0.9,
            ignoredKeys: [],
            ignoredMisprintKeys: [],
            customRegExpToFindKeys: []
        },
        tsconfigPath: './',
        projectPath: './src/app/**/*.{html,ts,resx}',
        languagesPath: './src/assets/i18n/*.json'
    }
};

const defaultConfig: object = {
    "rules": {
        "ast": {
            "isNgxTranslateImported": "error"
        },
        "keysOnViews": "error",
        "zombieKeys": "warning",
        "emptyKeys": "warning",
        "deepSearch": "disable",
        "misprintKeys": "disable",
        "maxWarning": "0",
        "misprintCoefficient": "0.9",
        "ignoredKeys": [],
        "ignoredMisprintKeys": [],
        "customRegExpToFindKeys": [],
    },
    "tsconfig": './',
    "project": './src/app/**/*.{html,ts,resx}',
    "languages": './src/assets/i18n/*.json',
};

export { config };
