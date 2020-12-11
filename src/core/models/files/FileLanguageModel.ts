import { get } from 'lodash';

import { KeyModel } from '../KeyModel';
import { FileModel } from './FileModel';
import { Key } from 'readline';

class FileLanguageModel extends FileModel {
    constructor(
        path: string,
        files: string[] = [],
        keys: KeyModel[] = [],
        ignore: string = '',
    ) {
        super(path, files, keys, ignore);
    }

    public getKeys(): FileLanguageModel {
        this.files =  this.getNormalizeFiles();
        this.keys = this.parseKeys((fileData: string, filePath: string): KeyModel[] => {
            try {
                const fileKeysNames: KeyModel[] = this.getLanguageKeys(JSON.parse(fileData));
                return !fileKeysNames ? [] : fileKeysNames
                    .filter(x => !!x)
                    .map((key) => {
                        return new KeyModel(key.name, [], [filePath], key.value);
                    });
            } catch (e) {
                const errorMessage: string = `Can't parse JSON file: ${filePath}`;
                throw new Error(errorMessage);
            }

        });
       return this;
    }

    private getLanguageKeys(obj: object, cat: string | null = null, tKeys: string[] = [], keys: KeyModel[] = []): KeyModel[] {
        const currentKeys: string[] = [ ...tKeys ];
        const objectKeys: string[] = Object.keys(obj);
        const correctKeyModel: KeyModel[] = keys;
        objectKeys.forEach((key: string) => {
            const keyValue: object = get(obj, key);
            const isObject: boolean = typeof keyValue === 'object';
            const currentKey: string =  cat === null ? key : cat.concat('.', key);

            if (isObject) {
                const childKeys: KeyModel[] = this.getLanguageKeys(keyValue, currentKey, tKeys, correctKeyModel);
                currentKeys.push(...childKeys.map((x) => x.name));
            } else {
                currentKeys.push(currentKey);
                correctKeyModel.push({
                    name: currentKey,
                    value: keyValue.toString(),
                    views: [],
                    languages: []
                });
            }
        });
        return correctKeyModel;
    }
}

export { FileLanguageModel };
