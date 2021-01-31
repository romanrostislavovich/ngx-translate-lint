import { DirectiveSymbol } from 'ngast';
import { ErrorFlow, ErrorTypes } from '../enums';
import { KeyModel, ResultErrorModel } from '../models';
import { NgModuleSymbol } from 'ngast/lib/ngtsc/module.symbol';

interface IRuleAst {
    flow: ErrorFlow;
    handler: ErrorTypes;
    modules: NgModuleSymbol[];
    check(projectPath: string, languagesKeys: KeyModel[]): ResultErrorModel[];
}

export { IRuleAst };
