import { DirectiveSymbol } from "ngast";
import { CompileNgModuleMetadata, CompileNgModuleSummary, CompileTypeMetadata } from "@angular/compiler";

export function isNgxTranslateImportedRule(directives: DirectiveSymbol[]): boolean {
    let result: boolean = false;
    directives.forEach(directive => {
        if (directive.isComponent()) {
            const directiveModule: CompileNgModuleMetadata | undefined =  directive.getModule();
            if (directiveModule) {
                directiveModule.importedModules.forEach((importModule: CompileNgModuleSummary) => {
                   if (checkIfReferenceHasNgxTranslate(importModule.type.reference) && !result) {
                       result = true;
                   } else if (!result) {
                       importModule.modules.forEach((modules: CompileTypeMetadata) => {
                           if (checkIfReferenceHasNgxTranslate(modules.reference) && !result) {
                               result = true;
                           }
                       });
                   }
                });
            }
        }
    });
    return result;
}

// tslint:disable-next-line:no-any
function checkIfReferenceHasNgxTranslate(reference: any): boolean {
    return reference.name === 'TranslateModule';
}
