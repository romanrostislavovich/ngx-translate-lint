import { ErrorTypes } from './enums';
import { IAppConfig } from './interface';

const config: IAppConfig = {
    defaultValues: {
        rules: {
            misprint: ErrorTypes.warning,
            zombieKeys: ErrorTypes.warning,
            keysOnViews: ErrorTypes.error,
            maxWarning: 1,
            misprintCoefficient: 0.9,
        },
        projectPath: './src/app/**/*.{html,ts}',
        languagesPath: './src/assets/i18n/*.json'
    }
};

const defaultConfig: object = {
    "rules": {
        "keysOnViews": "error",
        "zombieKeys": "warning",
        "misprint": "warning",
        "maxWarning": 1,
        "misprintCoefficient": 0.9
    },
    "project": './src/app/**/*.{html,ts}',
    "languages": './src/assets/i18n/*.json',
};

export { config };
