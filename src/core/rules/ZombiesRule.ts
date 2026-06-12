import { IRule } from './../interface';
import { ErrorTypes, ErrorFlow } from './../enums';
import { ResultErrorModel, KeyModel } from './../models';

class ZombieRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.zombieKeys;
    public handler: ErrorTypes;

    constructor(
        handler: ErrorTypes = ErrorTypes.error
    ) {
        this.handler = handler;
    }

    public check(viewKeys: KeyModel[], languagesKeys: KeyModel[]): ResultErrorModel[] {
        const viewKeyNames: Set<string> = new Set(viewKeys.map((key: KeyModel) => key.name));

        return languagesKeys.flatMap((key: KeyModel) => {
            if (viewKeyNames.has(key.name)) {
                return [];
            }

            return key.languages.map((languagePath: string) => {
                return new ResultErrorModel(
                    key.name,
                    this.flow,
                    this.handler,
                    languagePath
                );
            });
        });
    }
}

export { ZombieRule };
