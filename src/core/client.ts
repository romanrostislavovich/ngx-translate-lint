import { flatMap } from 'lodash';

import { config } from './config';
import { IRulesConfig } from './interface';
import { MisprintRule } from './rules/MisprintRule';
import { ErrorFlow, ErrorTypes } from './enums';
import { KeysUtils, resourceResolver } from './utils';
import { DirectiveSymbol, ErrorReporter, ProjectSymbols } from 'ngast';
import { AbsentViewKeysRule, isNgxTranslateImportedRule, ZombieRule } from './rules';
import { FileLanguageModel, FileViewModel, KeyModel, ResultCliModel, ResultErrorModel } from './models';

class NgxTranslateLint {
    public projectPath: string;
    public languagesPath: string;
    public rules: IRulesConfig;
    public ignore?: string;

    constructor (
        projectPath: string = config.defaultValues.projectPath,
        languagesPath: string = config.defaultValues.languagesPath,
        ignore?: string,
        rulesConfig: IRulesConfig = config.defaultValues.rules,
    ) {
        this.languagesPath = languagesPath;
        this.projectPath = projectPath;
        this.ignore = ignore;
        this.rules = rulesConfig;
    }

    public lint(maxWarning?: number): ResultCliModel {
        if (!(this.projectPath && this.languagesPath)) {
            throw new Error(`Path to project or languages is incorrect`);
        }

        if (!('zombieKeys' in this.rules)) {
            throw new Error('Error config is incorrect');
        }

        const languagesKeys: FileLanguageModel = new FileLanguageModel(this.languagesPath, [], [], this.ignore).getKeys();
        const languagesKeysNames: string[] = flatMap(languagesKeys.keys, (key: KeyModel) => key.name);
        const viewsRegExp: RegExp = KeysUtils.findKeysList(languagesKeysNames);
        const views: FileViewModel = new FileViewModel(this.projectPath, [], [], this.ignore).getKeys(viewsRegExp);

        const errors: ResultErrorModel[] = [];

        // TODO: RL: Refactor this
        if (this.rules.zombieKeys !== ErrorTypes.disable) {
            const ruleInstance: ZombieRule = new ZombieRule(this.rules.zombieKeys);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(views.keys, languagesKeys.keys);
            errors.push(...ruleResult);
        }

        if (this.rules.keysOnViews !== ErrorTypes.disable) {
            const ruleInstance: AbsentViewKeysRule = new AbsentViewKeysRule(this.rules.keysOnViews, languagesKeys.files);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(views.keys, languagesKeys.keys);
            errors.push(...ruleResult);
        }

        if (this.rules.misprint !== ErrorTypes.disable) {
            const ruleInstance: MisprintRule = new MisprintRule(this.rules.misprint, this.rules.misprintCoefficient);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(errors, languagesKeys.keys);
            errors.push(...ruleResult);
        }

        if (this.rules.ast) {
            const ruleResult: ResultErrorModel[] =  this.runAst(this.rules.ast);
            errors.push(...ruleResult);
        }

        const cliResult: ResultCliModel = new ResultCliModel(errors, maxWarning);
        return cliResult;
    }

    public runAst(project: string): ResultErrorModel[] {
        const resultErrors: ResultErrorModel[] = [];
        const projectSymbols: ProjectSymbols = new ProjectSymbols(
            project,
            resourceResolver,
            // tslint:disable-next-line:no-any
            (e: ErrorReporter) => {
                const error: ResultErrorModel = new ResultErrorModel(e.toString(), ErrorFlow.ngxTranslateNoImported, ErrorTypes.error, project);
                resultErrors.push(error);
            }
        );

        if (resultErrors.length) {
            const projectDirectives: DirectiveSymbol[] = projectSymbols.getDirectives().filter(el => el.symbol.filePath.indexOf("node_modules") === -1);
            const ruleResult: boolean = isNgxTranslateImportedRule(projectDirectives);
            if (ruleResult) {

            }
        }
        return resultErrors;
    }
}


export { NgxTranslateLint };
