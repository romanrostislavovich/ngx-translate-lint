import { DirectiveSymbol } from 'ngast';
import { CompileNgModuleMetadata, CompileNgModuleSummary, CompileTypeMetadata } from '@angular/compiler';

import { config } from '../../config';
import { IRuleAst } from '../../interface';
import { ResultErrorModel } from '../../models';
import { ErrorFlow, ErrorTypes } from '../../enums';

class AstIsNgxTranslateImportedRule implements IRuleAst {
    public flow: ErrorFlow;
    public handler: ErrorTypes;
    public directives: DirectiveSymbol[];

    constructor(
        directives: DirectiveSymbol[] = [],
        handler: ErrorTypes = config.defaultValues.rules.ast && config.defaultValues.rules.ast.isNgxTranslateLintImported ? config.defaultValues.rules.ast.isNgxTranslateLintImported : ErrorTypes.disable,
        flow: ErrorFlow = ErrorFlow.ngxTranslateNoImported,
    ) {
        this.flow = flow;
        this.handler = handler;
        this.directives = directives;
    }

    public check(projectPath: string): ResultErrorModel[] {
        let isNgxTranslateImported: boolean = false;
        const result: ResultErrorModel[] = [];
        this.directives.forEach(directive => {
            if (directive.isComponent()) {
                const directiveModule: CompileNgModuleMetadata | undefined =  directive.getModule();
                if (directiveModule) {
                    directiveModule.importedModules.forEach((importModule: CompileNgModuleSummary) => {
                       if (checkIfReferenceHasNgxTranslate(importModule.type.reference) && !result) {
                           isNgxTranslateImported = true;
                       } else if (!result) {
                           importModule.modules.forEach((modules: CompileTypeMetadata) => {
                               if (checkIfReferenceHasNgxTranslate(modules.reference) && !result) {
                                   isNgxTranslateImported = true;
                               }
                           });
                       }
                    });
                }
            }
        });

        debugger;
        if (!isNgxTranslateImported) {
            const error: ResultErrorModel = new ResultErrorModel('', this.flow, this.handler, projectPath);
            result.push(error);
        }
        return result;
    }
}

// tslint:disable-next-line:no-any
function checkIfReferenceHasNgxTranslate(reference: any): boolean {
    return reference.name === 'TranslateModule';
}

export { AstIsNgxTranslateImportedRule };
