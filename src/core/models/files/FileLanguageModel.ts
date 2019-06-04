import { get } from 'lodash';

import { KeyModel } from '../KeyModel';
import { FileModel } from './FileModel';

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
            const fileKeysNames: string[] = this.getLanguageKeys(JSON.parse(fileData));
            return !fileKeysNames ? [] : fileKeysNames
                .filter(x => !!x)
                .map((key: string) => {
                    return new KeyModel(key, [], [filePath]);
                });
        });
       return this;
    }

    private getLanguageKeys(obj: object, cat: string | null = null, tKeys: string[] = []): string[] {
        const currentKeys: string[] = [ ...tKeys ];
        const objectKeys: string[] = Object.keys(obj);

        objectKeys.forEach((key: string) => {
            const keyValue: object = get(obj, key);
            const isObject: boolean = typeof keyValue === 'object';
            const currentKey: string =  cat === null ? key : cat.concat('.', key);

            if (isObject) {
                const childKeys: string[] = this.getLanguageKeys(keyValue, currentKey, tKeys);
                currentKeys.push(...childKeys);
            } else {
                currentKeys.push(currentKey);
            }
        });
        return currentKeys;
    }
}

export { FileLanguageModel };
