import { ErrorTypes } from './enums';
import { IAppConfig } from './interface';

const config: IAppConfig = {
    defaultValues: {
        rules: {
            ast: {
              isNgxTranslateImported: ErrorTypes.error,
            },
            misprint: ErrorTypes.warning,
            zombieKeys: ErrorTypes.warning,
            keysOnViews: ErrorTypes.error,
            emptyKeys: ErrorTypes.warning,
            maxWarning: 0,
            misprintCoefficient: 0.9,
            ignoredKeys: [],
            ignoredMisprintKeys: []
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
        "misprint": "warning",
        "emptyKeys": "warning",
        "maxWarning": "0",
        "misprintCoefficient": "0.9",
        "ignoredKeys": [],
        "ignoredMisprintKeys": []
    },
    "tsconfig": './',
    "project": './src/app/**/*.{html,ts,resx}',
    "languages": './src/assets/i18n/*.json',
};

export { config };
