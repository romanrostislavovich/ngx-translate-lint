import { differenceBy } from 'lodash';

import { IRule } from './../interface';
import { ErrorTypes, ErrorFlow } from './../enums';
import { ResultErrorModel, KeyModel } from './../models';

class EmptyKeysRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.emptyKeys;
    public handler: ErrorTypes;

    constructor(
        handler: ErrorTypes = ErrorTypes.warning
    ) {
        this.handler = handler;
    }

    public check(languagesKeys: KeyModel[]): ResultErrorModel[] {
        const emptyKeyList: KeyModel[] = languagesKeys.filter((x) => x.value === '' || x.value === undefined || x.value === null);
        const resultErrorList: ResultErrorModel[] = emptyKeyList.reduce((result: ResultErrorModel[], key: KeyModel) => {
            const resultErrors: ResultErrorModel[] = key.languages.map((languagePath: string) => {
                const resultErrorModel: ResultErrorModel = new ResultErrorModel(key.name, this.flow, this.handler, languagePath);
                return resultErrorModel;
            });
            result.push(...resultErrors);
            return result;
        }, []);
        return resultErrorList;
    }
}

export { EmptyKeysRule };
