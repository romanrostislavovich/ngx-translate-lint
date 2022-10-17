import { flatMap } from 'lodash';
import * as path from 'path';
import { join } from 'path';
import { config } from './config';
import { ErrorTypes } from './enums';
import { IRulesConfig } from './interface';
import { KeysUtils } from './utils';
import { FileLanguageModel, FileViewModel, KeyModel, LanguagesModel, ResultCliModel, ResultErrorModel } from './models';
import { AbsentViewKeysRule, MisprintRule, ZombieRule, EmptyKeysRule } from './rules';
import { KeyModelWithLanguages, LanguagesModelWithKey, ViewModelWithKey } from './models/KeyModelWithLanguages';
import { WorkspaceSymbols } from 'ngast';
import { AstIsNgxTranslateImportedRule } from './rules/ast/IsNgxTranslateImportedAstRule';
import { NgModuleSymbol } from 'ngast/lib/ngtsc/module.symbol';


class NgxTranslateLint {
    public rules: IRulesConfig;
    public projectPath: string;
    public languagesPath: string;
    public tsConfigPath: string | undefined;

    public ignore?: string;

    constructor (
        projectPath: string = config.defaultValues.projectPath,
        languagesPath: string = config.defaultValues.languagesPath,
        ignore?: string,
        rulesConfig: IRulesConfig = config.defaultValues.rules,
        tsConfigPath?: string,
    ) {
        this.languagesPath = languagesPath;
        this.projectPath = projectPath;
        this.ignore = ignore;
        this.rules = rulesConfig;
        this.tsConfigPath = tsConfigPath;
    }

    public lint(maxWarning?: number): ResultCliModel {
        if (!(this.projectPath && this.languagesPath)) {
            throw new Error(`Path to project or languages is incorrect`);
        }

        if (!('zombieKeys' in this.rules)) {
            throw new Error('Error config is incorrect');
        }

        const languagesKeys: FileLanguageModel = new FileLanguageModel(this.languagesPath, [], [], this.ignore).getKeysWithValue();
        const languagesKeysNames: string[] = flatMap(languagesKeys.keys, (key: KeyModel) => key.name);
        const viewsRegExp: RegExp = KeysUtils.findKeysList(languagesKeysNames, this.rules.customRegExpToFindKeys, this.rules.deepSearch);

        const views: FileViewModel = new FileViewModel(this.projectPath, [], [], this.ignore).getKeys(viewsRegExp);

        let errors: ResultErrorModel[] = [];

        if (
            this.rules.zombieKeys !== ErrorTypes.disable ||
            this.rules.keysOnViews !== ErrorTypes.disable ||
            this.rules.misprintKeys !== ErrorTypes.disable ||
            this.rules.emptyKeys !== ErrorTypes.disable
        ) {
            const regExpResult: ResultErrorModel[] = this.runRegExp(views, languagesKeys);
            errors.push(...regExpResult);
        }

        if (this.rules.ast && this.rules.ast.isNgxTranslateImported && this.tsConfigPath) {
            const astResult: ResultErrorModel[] =  this.runAst(this.tsConfigPath, this.rules);
             errors.push(...astResult);
        }

        if(this.rules.ignoredKeys?.length !== 0) {
            errors = errors.reduce<ResultErrorModel[]>((acum, errorKey) => {
                const errorKeyValue: string = errorKey.value;
                if (!this.rules.ignoredKeys.some(ignoredKey => new RegExp(ignoredKey, "i").test(errorKeyValue))) {
                    const correctError: ResultErrorModel = new ResultErrorModel(
                        errorKey.value,
                        errorKey.errorFlow,
                        errorKey.errorType,
                        errorKey.currentPath,
                        errorKey.absentedPath,
                        errorKey.suggestions,
                    );
                    acum.push(correctError);
                }
                return acum;
            }, []);
        }

        const cliResult: ResultCliModel = new ResultCliModel(errors, maxWarning);
        return cliResult;
    }

    public getLanguages(): LanguagesModel[] {
        const result: LanguagesModel[] = [];
        const languagesFiles: FileLanguageModel = new FileLanguageModel(this.languagesPath, [], [], this.ignore);
        const languagesKeys: FileLanguageModel = languagesFiles.getKeysWithValue();

        if (languagesKeys.keys.length === 0) {
            languagesFiles.files.forEach((filePath: string) => {
                const languageName: string = path.basename(filePath, '.json');
                const languageModel: LanguagesModel = new LanguagesModel(languageName);
                languageModel.path = filePath;
                result.push(languageModel);
            });
        }

        languagesKeys.keys.forEach((key: KeyModel) => {
           key.languages.forEach((languagePath: string) => {
               const name: string = path.basename(languagePath);
               const languageIndex: number = result.findIndex((x) => x.name === name);

               if (languageIndex === -1) {
                   const language: LanguagesModel = new LanguagesModel(name);
                   language.path = languagePath;
                   language.keys.push(key);
                   result.push(language);
               } else {
                   result[languageIndex].keys.push(key);
               }
           });
        });

        if (this.projectPath) {
            const languagesKeysNames: string[] = flatMap(languagesKeys.keys, (key: KeyModel) => key.name);
            const viewsRegExp: RegExp = KeysUtils.findKeysList(languagesKeysNames, this.rules.customRegExpToFindKeys);
            const views: FileViewModel = new FileViewModel(this.projectPath, [], [], this.ignore).getKeys(viewsRegExp);

            views.keys.forEach((key: KeyModel) => {
               result.forEach((language: LanguagesModel) => {
                   const keyIndex: number = language.keys.findIndex((x) => x.name === key.name);
                   if (keyIndex !== -1 ){
                       language.keys[keyIndex].views = key.views;
                   }
               });
            });
        }

        return result;
    }

    public getKeys(): KeyModelWithLanguages[] {
        const result: KeyModelWithLanguages[] = [];
        const languagesKeys: LanguagesModel[] = this.getLanguages();
        languagesKeys.forEach((language: LanguagesModel) => {
           language.keys.forEach((key: KeyModel) => {
               const isKeyExistIndex: number = result.findIndex(x => x.name === key.name);
               if (isKeyExistIndex === -1 ) {

                   const viewsModels: ViewModelWithKey[] = key.views.map((x) => {
                       return new ViewModelWithKey(x);
                   });
                   const languagesModel: LanguagesModelWithKey = new LanguagesModelWithKey(language.name, language.path, key.value);
                   const keyModel: KeyModelWithLanguages = new KeyModelWithLanguages(key.name, [languagesModel], viewsModels);
                   result.push(keyModel);
               } else {
                    const currentKeyModel: KeyModelWithLanguages = result[isKeyExistIndex];
                    const viewsModels: ViewModelWithKey[] = key.views.map((x) => {
                       return new ViewModelWithKey(x);
                    });
                    const languagesModel: LanguagesModelWithKey = new LanguagesModelWithKey(language.name, language.path, key.value);
                    currentKeyModel.languages.push(languagesModel);
                    currentKeyModel.views.push(...viewsModels);
               }
           });
        });
        return result;

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

        if (rules.misprintKeys !== ErrorTypes.disable) {
            const ruleInstance: MisprintRule = new MisprintRule(this.rules.misprintKeys, this.rules.misprintCoefficient, this.rules.ignoredMisprintKeys);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(result, languagesKeys.keys);
            result.push(...ruleResult);
        }


        if (rules.emptyKeys !== ErrorTypes.disable) {
            const ruleInstance: EmptyKeysRule = new EmptyKeysRule(this.rules.emptyKeys);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(languagesKeys.keys);
            result.push(...ruleResult);
        }

        return result;
    }

    private runAst(
        project: string,
        rules: IRulesConfig = this.rules
   ): ResultErrorModel[] {
         const resultErrors: ResultErrorModel[] = [];
         const configPath: string = join(project, 'tsconfig.json');
         const projectSymbols: WorkspaceSymbols = new WorkspaceSymbols(configPath);

        const allProjectModules: NgModuleSymbol[] = projectSymbols.getAllModules();

        // RULE: Is `ngx-translate` module imported
        if (!!rules.ast && rules.ast.isNgxTranslateImported !== ErrorTypes.disable) {
             const isNgxTranslateImported: AstIsNgxTranslateImportedRule = new AstIsNgxTranslateImportedRule(allProjectModules);
             const isNgxTranslateResult: ResultErrorModel[] = isNgxTranslateImported.check(project);
            resultErrors.push(...isNgxTranslateResult);
        }

         return resultErrors;
    }
}


export { NgxTranslateLint };
