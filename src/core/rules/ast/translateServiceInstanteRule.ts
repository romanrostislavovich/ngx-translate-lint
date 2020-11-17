import { CompileNgModuleMetadata } from '@angular/compiler';

import { DirectiveSymbol } from 'ngast';
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
            if (directive.isAnalysed) {
                // tslint:disable-next-line:no-any
                const directiveModule: any | undefined =  directive.getDependencies();
                // tslint:disable-next-line:no-any
                const directiveSymbol: any[] = directive.getProviders();
            }
        });

        const error: ResultErrorModel = new ResultErrorModel('', ErrorFlow.ngxTranslateNoImported, ErrorTypes.error, projectPath);
        result.push(error);

        return result;
    }

    private createError(): void {}
}


export { AstTranslateServiceRule };
