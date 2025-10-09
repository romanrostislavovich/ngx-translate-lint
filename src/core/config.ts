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
        project: './src/app/**/*.{html,ts,resx}',
        languages: './src/assets/i18n/*.json',
        fixZombiesKeys: false,
    }
};

export { config };
