import { FileModel } from "./FileModel";
import { KeyModel } from "../KeyModel";

class FileViewModel extends FileModel {
    constructor(
        path: string,
        files: string[] = [],
        keys: KeyModel[] = [],
        ignore: string = '',
    ) {
        super(path, files, keys, ignore);
    }

    public getKeys(regExp: RegExp): FileViewModel {
        this.files = this.getNormalizeFiles();

        this.keys = this.parseKeys((fileData: string, filePath: string): KeyModel[] => {
            const fileKeysNames:  RegExpMatchArray | null = fileData.match(regExp);

            if (!fileKeysNames) {
                return [];
            }

            const uniqueKeys: Set<string> = new Set(fileKeysNames);
            const result: KeyModel[] = [];

            for (const key of uniqueKeys) {
                if (key) { // Заменяет старый .filter(x => !!x)
                    result.push(new KeyModel(key, [filePath], []));
                }
            }

            return result;
        });

        return this;
    }
}

export { FileViewModel };