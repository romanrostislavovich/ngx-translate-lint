import { flatMap } from 'lodash';

import { config } from './config';
import { ErrorFlow, ErrorTypes } from './enums';
import { IRuleAst, IRulesConfig } from './interface';
import { KeysUtils, resourceResolver } from './utils';
import { DirectiveSymbol, ErrorReporter, ProjectSymbols } from 'ngast';
import { AbsentViewKeysRule, ZombieRule, AstIsNgxTranslateImportedRule, MisprintRule } from './rules';
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

        if (
            this.rules.zombieKeys !== ErrorTypes.disable ||
            this.rules.keysOnViews !== ErrorTypes.disable ||
            this.rules.misprint !== ErrorTypes.disable
        ) {
            const regExpResult: ResultErrorModel[] = this.runRegExp(views, languagesKeys);
            errors.push(...regExpResult);
        }

        if (this.rules.ast) {
            const astResult: ResultErrorModel[] =  this.runAst(this.rules.ast);
            errors.push(...astResult);
        }

        const cliResult: ResultCliModel = new ResultCliModel(errors, maxWarning);
        return cliResult;
    }

    private runRegExp(
        views: FileViewModel,
        languagesKeys: FileLanguageModel,
        rules: IRulesConfig = this.rules
    ): ResultErrorModel[] {
        const result: ResultErrorModel[] = [];
        if (rules.zombieKeys !== ErrorTypes.disable) {
            const ruleInstance: ZombieRule = new ZombieRule(this.rules.zombieKeys);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(views.keys, languagesKeys.keys);
            result.push(...ruleResult);
        }

        if (rules.keysOnViews !== ErrorTypes.disable) {
            const ruleInstance: AbsentViewKeysRule = new AbsentViewKeysRule(this.rules.keysOnViews, languagesKeys.files);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(views.keys, languagesKeys.keys);
            result.push(...ruleResult);
        }

        if (rules.misprint !== ErrorTypes.disable) {
            const ruleInstance: MisprintRule = new MisprintRule(this.rules.misprint, this.rules.misprintCoefficient);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(result, languagesKeys.keys);
            result.push(...ruleResult);
        }

        return result;
    }

    private runAst(
        project: string,
        rules: IRulesConfig = this.rules
    ): ResultErrorModel[] {
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

            // RULE: Is `ngx-translate` module imported
            const ruleInstance: IRuleAst = new AstIsNgxTranslateImportedRule(projectDirectives);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(project);
            resultErrors.push(...ruleResult);
        }
        return resultErrors;
    }
}


export { NgxTranslateLint };
