import { KeyModel } from "./../models";
import { ToggleRule } from './../enums';

class KeysUtils {
    public static groupKeysByName(keys: KeyModel[]) : KeyModel[] {
        const grouped: Map<string, {
            views: Set<string>
            languages: Set<string>
        }> = new Map<string, { views: Set<string>; languages: Set<string> }>();

        for (const key of keys) {
            let existing: {
                views: Set<string>
                languages: Set<string>
            } | undefined = grouped.get(key.name);

            if (!existing) {
                existing = { views: new Set(), languages: new Set() };
                grouped.set(key.name, existing);
            }

            for (const view of key.views) {
                existing.views.add(view);
            }
            for (const language of key.languages) {
                existing.languages.add(language);
            }
        }

        const result: KeyModel[] = [];
        for (const [name, data] of grouped.entries()) {
            result.push(new KeyModel(name, Array.from(data.views), Array.from(data.languages)));
        }

        return result;
    }

    public static findKeysList(
        keys: string[],
        customRegExp: Array<string | RegExp> = [],
        deepSearch: ToggleRule = ToggleRule.disable,
        toolsRegEx: string[] = []
    ): RegExp {
        const resultKeysRegExp: string[] = [...toolsRegEx];

        if (deepSearch === ToggleRule.enable && keys.length > 0) {
            const keysListRegExp: string = keys.map((key: string) => {
                const escapedKey: string = key.replace(/\./g, '\\.');
                return `(?<=[^\\w.-])${escapedKey}(?=[^\\w.-])`;
            }).join('|');

            resultKeysRegExp.push(keysListRegExp);
        }

        for (const regexp of customRegExp) {
            resultKeysRegExp.push(typeof regexp === 'string' ? regexp : regexp.source);
        }

        return new RegExp(resultKeysRegExp.join('|'), 'gm');
    }
}

export { KeysUtils };