import { DirectiveSymbol } from 'ngast';
import { CompileNgModuleMetadata, CompileNgModuleSummary, CompileTypeMetadata } from '@angular/compiler';

import { IRuleAst } from '../interface';
import { ResultErrorModel } from '../models';
import { ErrorFlow, ErrorTypes } from '../enums';

class AstIsNgxTranslateImportedRule implements IRuleAst {
    public directives: DirectiveSymbol[];

    constructor(
        directives: DirectiveSymbol[] = []
    ) {
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

        if (!isNgxTranslateImported) {
            const error: ResultErrorModel = new ResultErrorModel('', ErrorFlow.ngxTranslateNoImported, ErrorTypes.error, projectPath);
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
