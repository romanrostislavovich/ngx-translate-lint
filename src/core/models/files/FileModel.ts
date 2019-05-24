import fs from 'fs';

import { KeyModel } from "./../KeyModel";
import { PathUtils, KeysUtils } from "./../../utils";

abstract class FileModel {
    public path: string;
    public keys: KeyModel[];
    public files: string[];

    constructor(
        path: string,
        files: string[] = [],
        keys: KeyModel[] = [],
    ) {
        this.path = path;
        this.keys = keys;
        this.files = files;
    }

    public validatePath(): void {
        this.files = PathUtils.getNormalizeFiles(this.path);

        if (!this.files.length) {
            throw Error(`Cannot found files for path: '${this.path}'`);
        }
    }


    public setKeys(identity: Function): void {
        const keysModels: KeyModel[] = this.files.reduce((acum: KeyModel[], filePath: string) => {
            const fileData: string = fs.readFileSync(filePath).toString();
            const models: KeyModel[] = identity(fileData, filePath);
            acum.push(...models);
            return acum;
        }, []);
        this.keys = KeysUtils.groupKeysByName(keysModels);
    }
}

export { FileModel };
