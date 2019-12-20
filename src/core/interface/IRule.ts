import { ErrorFlow, ErrorTypes } from "../enums";
import { ResultErrorModel, KeyModel } from "./../models";

interface IRule {
    flow: ErrorFlow;
    handler: ErrorTypes;
    check(viewKeys: KeyModel[], langaugesKeys: KeyModel[]): ResultErrorModel[];
}

export { IRule };
