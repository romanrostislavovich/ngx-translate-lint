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
        return languagesKeys.flatMap((key: KeyModel) => {
            if (key.value === '' || key.value === undefined || key.value === null) {
                return key.languages.map((languagePath: string) => {
                    return new ResultErrorModel(
                        key.name,
                        this.flow,
                        this.handler,
                        languagePath
                    );
                });
            }

            return [];
        });
    }
}

export { EmptyKeysRule };
