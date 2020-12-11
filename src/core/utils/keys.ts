import { chain, union, map } from 'lodash';

import { KeyModel } from "./../models";

class KeysUtils {
    public static groupKeysByName(keys: KeyModel[]) : KeyModel[] {
        return chain<KeyModel>(keys).groupBy("name").map((dictionary, key) => {
            const views: string[] | undefined  = union(...map<KeyModel, keyof KeyModel>(dictionary, 'views'));
            const languages: string[] | undefined = union(...map<KeyModel, keyof KeyModel>(dictionary, 'languages'));
            const item: KeyModel = new KeyModel(key, views, languages);
            return item;
        }).value();
    }

    public static findKeysList(keys: string[]): RegExp {
        const keysFromDirectiveInsideTag: string = `(?<=<[^<]*[\\s*\\w*\\s*]*(translate|TRANSLATE)[\\s*\\w*\\s*]*[^>]*>\\s*)([a-zA-Z0-9_.]*)(?=\\s*<\\s*\\/.*\\s*>)`;
        const keysFromDirectiveInView: string = `(?<=translate=["']{1,2}|\\[translate\\]=["']{1,2})([A-Za-z0-9_.]+)(?=["']{1,2})`;
        const keysFromPipeInView: string = `(?<=['"])([a-zA-Z0-9_\\-.]*)(?=['"]\\s?\\|\\s?translate|['"](\\s*\\|\\s*\\w*)*translate)`;
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
        return new RegExp(resultKeysRegExp.join('|'), 'gm');
    }
}

export { KeysUtils };
