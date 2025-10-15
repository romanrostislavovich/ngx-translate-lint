import { chain, map, union } from 'lodash';

import { KeyModel } from "./../models";
import { ToggleRule } from './../enums';

class KeysUtils {
    public static groupKeysByName(keys: KeyModel[]) : KeyModel[] {
        return chain<KeyModel>(keys).groupBy("name").map((dictionary, key) => {
            const views: string[] | undefined  = union(...map<KeyModel, keyof KeyModel>(dictionary, 'views'));
            const languages: string[] | undefined = union(...map<KeyModel, keyof KeyModel>(dictionary, 'languages'));
            const item: KeyModel = new KeyModel(key, views, languages);
            return item;
        }).value();
    }

    public static findKeysList(keys: string[], customRegExp: string[] | RegExp[] = [], deepSearch: ToggleRule = ToggleRule.disable, toolsRegEx: string[] = []): RegExp {
        let keysListRegExp: string = '';
        if (deepSearch === ToggleRule.enable) {
            keysListRegExp = keys.map((key: string) => {
                const regExpForSingleKey: string = `(?<=[^\\w.-])${key.replace('.', '\\.')}(?=[^\\w.-])`;
                return regExpForSingleKey;
            }).join('|');
        }

        // @ts-ignore
        const customRegExpList: string[] = customRegExp.map((regexp: string ) => {
           return `${regexp}`;
        });
        const resultKeysRegExp: string[] = [
            ...toolsRegEx,
            ...customRegExpList
        ];
        if (deepSearch === ToggleRule.enable) {
            resultKeysRegExp.unshift(keysListRegExp);
        }
        return new RegExp(resultKeysRegExp.join('|'), 'gm');
    }
}

export { KeysUtils };
