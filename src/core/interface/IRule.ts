import { ErrorFlow, ErrorTypes } from 'src/core/enums';
import { ResultErrorModel, KeyModel } from 'src/core/models';

interface IRule {
    flow: ErrorFlow;
    handler: ErrorTypes;
    check(viewKeys: KeyModel[], languagesKeys: KeyModel[]): ResultErrorModel[];
}

export { IRule };
