import { ErrorTypes, ToggleRule } from './enums';
import { IAppConfig } from './interface';

const config: IAppConfig = {
    defaultValues: {
        rules: {
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
        projectPath: './src/app/**/*.{html,ts,resx}',
        languagesPath: './src/assets/i18n/*.json'
    }
};

export { config };
