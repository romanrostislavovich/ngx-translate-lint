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
            const fileKeysNames: string[] = fileData.match(regExp) as string[];
            return !fileKeysNames ? [] : fileKeysNames
                .filter(x => !!x)
                .map((key: string) => new KeyModel(key, [filePath], []));
        });
        return this;
    }
}

export { FileViewModel };
