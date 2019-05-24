import { ErrorTypes } from './enums';
import { IAppConfig } from './interface';

const config: IAppConfig = {
    findKeysList(keys: string[]): RegExp {
        const keysFromDirectiveInsideTag: string = `(?<=<[\\s*\\w*\\s*]*translate[\\s*\\w*\\s*]*[^>]*>\\s*)([a-zA-Z0-9_.]*)(?=\\s*<\\s*\\/.*\\s*>)`;
        const keysFromDirectiveInView: string = `(?<=translate=["']{1,2}|\\[translate\\]=["']{1,2})([A-Za-z0-9_.]+)(?=["']{1,2})`;
        const keysFromPipeInView: string = `(?<=['"])([a-zA-Z0-9_.]*)(?=['"]\\s?\\|\\s?translate|['"](\\s*\\|\\s*\\w*)*translate)`;
        const keysListRegExp: string = keys.map((key: string) => {
            const regExpForSingleKey: string = `(?<=[^\\w.-])${key.replace('.', '\\.')}(?=[^\\w.-])`;
            return regExpForSingleKey;
        }).join('|');
        const resultKeysRegExp: string[] = [
            keysListRegExp,
            keysFromPipeInView,
            keysFromDirectiveInView,
            keysFromDirectiveInsideTag,
        ];
        return new RegExp(resultKeysRegExp.join('|'), 'gmi');
    },
    defaultValues: {
        rules: {
            keysOnViews: ErrorTypes.error,
            zombieKeys: ErrorTypes.warning,
        },
        projectPath: './src/app/**/*.{html,ts}',
        languagesPath: './src/assets/i18n/*.json'
    }
};

export { config };
