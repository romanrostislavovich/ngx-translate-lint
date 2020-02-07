import { CompileNgModuleMetadata } from '@angular/compiler';

import { DirectiveSymbol, ProviderSymbol } from 'ngast';
import { config, ErrorFlow, ErrorTypes, IRuleAst, KeyModel, ResultErrorModel } from "../..";

class AstTranslateServiceRule implements IRuleAst {
    public flow: ErrorFlow;
    public handler: ErrorTypes;
    public directives: DirectiveSymbol[];

    constructor(
        directives: DirectiveSymbol[] = [],
        handler: ErrorTypes = config.defaultValues.rules.ast && config.defaultValues.rules.ast.ngxTranslateService ? config.defaultValues.rules.ast.ngxTranslateService : ErrorTypes.disable,
        flow: ErrorFlow = ErrorFlow.ngxTranslateService,
    ) {
        this.flow = flow;
        this.handler = handler;
        this.directives = directives;
    }

    public check(projectPath: string, languagesKeys: KeyModel[] = []): ResultErrorModel[] {
        const result: ResultErrorModel[] = [];
        this.directives.forEach(directive => {
            if (directive.isComponent()) {
                const directiveModule: CompileNgModuleMetadata | undefined =  directive.getModule();
                const directiveSymbol: ProviderSymbol[] = directive.getViewProviders();
            }
        });

        const error: ResultErrorModel = new ResultErrorModel('', ErrorFlow.ngxTranslateNoImported, ErrorTypes.error, projectPath);
        result.push(error);

        return result;
    }

    private createError(): void {}
}


export { AstTranslateServiceRule };
