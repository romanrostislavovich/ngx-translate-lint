import { DirectiveSymbol } from 'ngast';
import { ResultErrorModel } from '../models/results';

interface IRuleAst {
    directives: DirectiveSymbol[];
    check(projectPath: string): ResultErrorModel[];
}

export { IRuleAst };
