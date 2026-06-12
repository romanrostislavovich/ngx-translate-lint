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
            this.keys = fileKeysNames.map((key: string) => {
                return new KeyModel(key, [], [this.path]);
            });
            return this;
        } else {
            this.files = this.getNormalizeFiles();
            this.keys = this.parseKeys((fileData: string, filePath: string): KeyModel[] => {
                try {
                    const fileKeysNames: string[] = this.getLanguageKeys(JSON.parse(this.fileData || fileData));
                    return fileKeysNames.map((key: string) => {
                        return new KeyModel(key, [], [filePath]);
                    });
                } catch (e) {
                    throw new Error(`Can't parse JSON file: ${filePath}`);
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
                    const fileKeysNames: KeyModel[] = this.getLanguageKeysWithValue(JSON.parse(this.fileData || fileData));
                    return fileKeysNames.map((key: KeyModel) => {
                        key.languages.push(filePath);
                        return key;
                    });
                } catch (e) {
                    throw new Error(`Can't parse JSON file: ${filePath}`);
                }
            });
            return this;
        }
    }

    private getLanguageKeysWithValue(
        obj: object,
        cat: string = '',
        accumulator: KeyModel[] = []
    ): KeyModel[] {
        if (!obj || typeof obj !== 'object') {
            return accumulator;
        }

        const objectKeys: string[] = Object.keys(obj);

        for (const key of objectKeys) {
            // tslint:disable-next-line:no-any
            // @ts-ignore
            const keyValue: any = obj[key];
            const currentKey: string = cat ? `${cat}.${key}` : key;

            if (keyValue !== null && typeof keyValue === 'object' && !Array.isArray(keyValue)) {
                this.getLanguageKeysWithValue(keyValue, currentKey, accumulator);
            } else {
                accumulator.push({
                    name: currentKey,
                    value: String(keyValue ?? ''), // Безопасное преобразование в строку
                    views: [],
                    languages: []
                } as KeyModel);
            }
        }

        return accumulator;
    }

    private getLanguageKeys(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // tslint:disable-next-line:no-any
        obj: any,
        cat: string = '',
        accumulator: string[] = []
    ): string[] {
        if (!obj || typeof obj !== 'object') {
            return accumulator;
        }

        const objectKeys: string[] = Object.keys(obj);

        for (const key of objectKeys) {
            // tslint:disable-next-line:no-any
            const keyValue: any = obj[key];
            const currentKey: string = cat ? `${cat}.${key}` : key;

            if (keyValue !== null && typeof keyValue === 'object' && !Array.isArray(keyValue)) {
                this.getLanguageKeys(keyValue, currentKey, accumulator);
            } else {
                accumulator.push(currentKey);
            }
        }

        return accumulator;
    }
}

export { FileLanguageModel };