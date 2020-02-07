import { DirectiveSymbol } from 'ngast';
import { ErrorFlow, ErrorTypes } from '../enums';
import { KeyModel, ResultErrorModel } from '../models';

interface IRuleAst {
    flow: ErrorFlow;
    handler: ErrorTypes;
    directives: DirectiveSymbol[];
    check(projectPath: string, languagesKeys: KeyModel[]): ResultErrorModel[];
}

export { IRuleAst };
