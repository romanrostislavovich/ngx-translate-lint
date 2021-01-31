import { config } from '../../config';
import { IRuleAst } from '../../interface';
import { ResultErrorModel } from '../../models';
import { ErrorFlow, ErrorTypes } from '../../enums';
import { NgModuleSymbol } from 'ngast/lib/ngtsc/module.symbol';

class AstIsNgxTranslateImportedRule implements IRuleAst {
    public flow: ErrorFlow;
    public handler: ErrorTypes;
    public modules: NgModuleSymbol[];

    constructor(
        directives: NgModuleSymbol[] = [],
        handler: ErrorTypes = config.defaultValues.rules.ast && config.defaultValues.rules.ast.isNgxTranslateImported ? config.defaultValues.rules.ast.isNgxTranslateImported : ErrorTypes.disable,
        flow: ErrorFlow = ErrorFlow.astIsNgxTranslateImported,
    ) {
        this.flow = flow;
        this.handler = handler;
        this.modules = directives;
    }

    public check(projectPath: string): ResultErrorModel[] {
        let isNgxTranslateImported: boolean = false;
        const result: ResultErrorModel[] = [];
        this.modules.forEach((module: NgModuleSymbol) => {
            const moduleImports: NgModuleSymbol[] | undefined = module.getImports();
            moduleImports?.forEach((importedModule: NgModuleSymbol) => {
                if(importedModule.node.name.escapedText === 'TranslateModule') {
                    isNgxTranslateImported = true;
                }
            });
        });

        if (!isNgxTranslateImported) {
            const error: ResultErrorModel = new ResultErrorModel('', this.flow, this.handler, projectPath);
            result.push(error);
        }
        return result;
    }
}


export { AstIsNgxTranslateImportedRule };
