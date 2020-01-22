import { ErrorFlow, ErrorTypes } from "../enums";
import { KeyModel, ResultErrorModel } from "../models";


interface IRule {
    flow: ErrorFlow;
    handler: ErrorTypes;
    check(viewKeys: KeyModel[] | ResultErrorModel[], languagesKeys: KeyModel[] | ResultErrorModel[]): ResultErrorModel[];
}

export { IRule };
