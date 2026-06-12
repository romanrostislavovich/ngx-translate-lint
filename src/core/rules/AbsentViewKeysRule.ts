import * as path from 'node:path';

import { IRule } from './../interface';
import { KeysUtils } from './../utils';
import { ErrorTypes, ErrorFlow } from './../enums';
import { ResultErrorModel, KeyModel } from './../models';

class AbsentViewKeysRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.keysOnViews;
    public handler: ErrorTypes;
    public languagesPathList: string[];

    public languagesCount(): number {
        return this.languagesPathList.length;
    }

    constructor (
        handler: ErrorTypes = ErrorTypes.error,
        languagesPathList: string[],
    ) {
        this.handler = handler;
        this.languagesPathList = languagesPathList;
    }

    public check(viewsKeys: KeyModel[], languagesKeys: KeyModel[]): ResultErrorModel[] {
        const keysList: KeyModel[] = KeysUtils.groupKeysByName([...viewsKeys, ...languagesKeys]);
        const targetLanguagesCount: number = this.languagesCount();

        return keysList.flatMap((key: KeyModel) => {
            if (key.languages.length === targetLanguagesCount) {
                return [];
            }

            const existingLanguages: Set<string> = new Set(key.languages);
            const absentLanguagePath: string[] = this.languagesPathList
                .filter((filePath: string) => !existingLanguages.has(filePath))
                .map((filePath: string) => path.basename(filePath));

            return key.views.map((viewPath: string) => {
                return new ResultErrorModel(
                    key.name,
                    this.flow,
                    this.handler,
                    viewPath,
                    absentLanguagePath
                );
            });
        });
    }
}

export { AbsentViewKeysRule };
