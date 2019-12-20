import fs from 'fs';

import { KeyModel } from 'src/core/models';
import { PathUtils, KeysUtils } from 'src/core/utils';

abstract class FileModel {
    public path: string;
    public keys: KeyModel[];
    public files: string[];
    public ignore: string | undefined;

    protected constructor(
        path: string,
        files: string[] = [],
        keys: KeyModel[] = [],
        ignore: string | undefined = undefined,
    ) {
        this.path = path;
        this.keys = keys;
        this.files = files;
        this.ignore = ignore;
    }

    public getNormalizeFiles(): string[] {
        const ignorePathList: string[] = this.ignore && this.ignore !== '' ? this.ignore.split(',') : [];
        const resultFilesList: string[] = PathUtils.getNormalizeFiles(this.path, ignorePathList);

        if (!resultFilesList.length) {
            throw Error(`Cannot found files for path: '${this.path}'`);
        }
        return resultFilesList;
    }


    public parseKeys(identity: Function): KeyModel[] {
        const keysModels: KeyModel[] = this.files.reduce((acum: KeyModel[], filePath: string) => {
            const fileData: string = fs.readFileSync(filePath).toString();
            const models: KeyModel[] = identity(fileData, filePath);
            acum.push(...models);
            return acum;
        }, []);
        return KeysUtils.groupKeysByName(keysModels);
    }
}

export { FileModel };
