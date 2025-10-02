import { get, transform } from 'lodash';

import { KeyModel } from '../KeyModel';
import { FileModel } from './FileModel';

class FileLanguageModel extends FileModel {
    public fileData?: string;
    public isURL?: boolean;
    constructor(
        path: string,
        files: string[] = [],
        keys: KeyModel[] = [],
        ignore: string = '',
        fileData?: string,
        isURL: boolean = false
    ) {
        super(path, files, keys, ignore);
        this.fileData = fileData;
        this.isURL = isURL;
    }

    public getKeys(): FileLanguageModel {
        if (this.isURL) {
            this.files = [this.path];
            const fileKeysNames: string[] = this.getLanguageKeys(JSON.parse(this.fileData || '{}'));
            this.keys = !fileKeysNames ? [] : fileKeysNames
                .filter(x => !!x)
                .map((key: string) => {
                    return new KeyModel(key, [], [this.path]);
                });
            return  this;
        } else {
            this.files =  this.getNormalizeFiles();
            this.keys = this.parseKeys((fileData: string, filePath: string): KeyModel[] => {
                try {
                    const fileKeysNames: string[] = this.getLanguageKeys(JSON.parse(this.fileData || fileData));
                    return !fileKeysNames ? [] : fileKeysNames
                        .filter(x => !!x)
                        .map((key: string) => {
                            return new KeyModel(key, [], [filePath]);
                        });
                } catch (e) {
                    const errorMessage: string = `Can't parse JSON file: ${filePath}`;
                    throw new Error(errorMessage);
                }

            });
            return this;
        }

    }

    public getKeysWithValue(): FileLanguageModel {
        if (this.isURL) {
            this.files = [this.path];
           const fileKeysNames: KeyModel[] = this.getLanguageKeysWithValue(JSON.parse(this.fileData || '{}'));
           this.keys = fileKeysNames.map((key: KeyModel) => {
                key.languages.push(this.path);
                return key;
           });
           return this;
        } else {
            this.files = this.getNormalizeFiles();
            this.keys = this.parseKeysWithValues((fileData: string, filePath: string): KeyModel[] => {
                try {
                    const fileKeysNames: KeyModel[]  = this.getLanguageKeysWithValue(JSON.parse(this.fileData || fileData));
                    return fileKeysNames.map((key: KeyModel) => {
                        key.languages.push(filePath);
                        return key;
                    });
                } catch (e) {
                    const errorMessage: string = `Can't parse JSON file: ${filePath}`;
                    throw new Error(errorMessage);
                }

            });
            return this;
        }

    }

    private getLanguageKeysWithValue(obj: object, cat: string | null = null, tKeys: string[] = [], tValues: KeyModel[] = []): KeyModel[] {
        const currentKeys: string[] = [ ...tKeys ];
        const correctKeys: KeyModel[] = tValues;
        const objectKeys: string[] = Object.keys(obj);

        objectKeys.forEach((key: string) => {
            // @ts-ignore
            const keyValue: object = get(obj, key);
            const isObject: boolean = typeof keyValue === 'object';
            const currentKey: string =  cat === null ? key : cat.concat('.', key);

            if (isObject) {
                const childKeys: string[] = this.getLanguageKeysWithValue(keyValue, currentKey, tKeys, correctKeys).map((x) => x.name);
                currentKeys.push(...childKeys);
            } else {
                correctKeys.push({
                    name: currentKey,
                    value: keyValue.toString(),
                    views: [],
                    languages: []
                });
            }
        });
        return correctKeys;
    }

    private getLanguageKeys(obj: object, cat: string | null = null, tKeys: string[] = []): string[] {
        const currentKeys: string[] = [ ...tKeys ];
        const objectKeys: string[] = Object.keys(obj);

        objectKeys.forEach((key: string) => {
            // @ts-ignore
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
