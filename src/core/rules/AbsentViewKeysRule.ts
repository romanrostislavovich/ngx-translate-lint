import path from 'path';
import { differenceBy } from 'lodash';

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
        const keysList: KeyModel[] = KeysUtils.groupKeysByName([ ...viewsKeys, ...languagesKeys]);
        const keysListError: KeyModel[] = keysList.filter((key: KeyModel) => !(key.languages.length === this.languagesCount()));
        const resultErrorList: ResultErrorModel[] = keysListError.reduce((result: ResultErrorModel[], key: KeyModel) => {
            const resultErrors: ResultErrorModel[] = key.views.map((viewPath: string) => {
                const absentLanguagePath: string[] = differenceBy(this.languagesPathList, key.languages)
                    .map((filePath: string) => path.basename(filePath));
                const resultErrorModel: ResultErrorModel = new ResultErrorModel(key.name, this.flow, this.handler, viewPath, absentLanguagePath);
                return resultErrorModel;
            });
            result.push(...resultErrors);
            return result;
        }, []);
        return resultErrorList;
    }
}

export { AbsentViewKeysRule };
