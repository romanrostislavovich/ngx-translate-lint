import { flatMap } from 'lodash';

import { config } from './config';
import { ErrorFlow, ErrorTypes } from './enums';
import { IRulesConfig } from './interface';
import { KeysUtils, resourceResolver } from './utils';
import { FileLanguageModel, FileViewModel, KeyModel, ResultCliModel, ResultErrorModel, LanguagesModel } from './models';
import {
    AbsentViewKeysRule,
    MisprintRule,
    ZombieRule
} from './rules';
import * as path from 'path';
import { KeyModelWithLanguages, LanguagesModelWithKey, ViewModelWithKey } from './models/KeyModelWithLanguages';

class NgxTranslateLint {
    public rules: IRulesConfig;
    public projectPath: string;
    public languagesPath: string;

    public ignore?: string;

    constructor (
        projectPath: string = config.defaultValues.projectPath,
        languagesPath: string = config.defaultValues.languagesPath,
        ignore?: string,
        rulesConfig: IRulesConfig = config.defaultValues.rules
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

        let errors: ResultErrorModel[] = [];

        if (
            this.rules.zombieKeys !== ErrorTypes.disable ||
            this.rules.keysOnViews !== ErrorTypes.disable ||
            this.rules.misprint !== ErrorTypes.disable
        ) {
            const regExpResult: ResultErrorModel[] = this.runRegExp(views, languagesKeys);
            errors.push(...regExpResult);
        }

       // if (this.rules.ast && this.rules.ast.isNgxTranslateLintImported) {
            // const astResult: ResultErrorModel[] =  this.runAst(this.tsconfigPath, languagesKeys, this.rules);
            // errors.push(...astResult);
        // }

        if(this.rules.ignoredKeys?.length !== 0) {
            errors = errors.reduce<ResultErrorModel[]>((acum, errorKey) => {
                const errorKeyValue: string = errorKey.value;
                if (!this.rules.ignoredKeys.includes(errorKeyValue)) {
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
        const languagesKeys: FileLanguageModel = new FileLanguageModel(this.languagesPath, [], [], this.ignore).getKeysWithValue();

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
            const viewsRegExp: RegExp = KeysUtils.findKeysList(languagesKeysNames);
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

        if (rules.misprint !== ErrorTypes.disable) {
            const ruleInstance: MisprintRule = new MisprintRule(this.rules.misprint, this.rules.misprintCoefficient, this.rules.ignoredMisprintKeys);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(result, languagesKeys.keys);
            result.push(...ruleResult);
        }

        return result;
    }

    // private runAst(
    //     project: string,
    //     languagesKeys: FileLanguageModel,
    //     rules: IRulesConfig = this.rules
    // ): ResultErrorModel[] {
    //     const resultErrors: ResultErrorModel[] = [];
        // const projectSymbols: any = new ProjectSymbols(
        //     project,
        //     resourceResolver,
        //     // tslint:disable-next-line:no-any
        //     (e: any) => {
        //         const error: ResultErrorModel = new ResultErrorModel(e.toString(), ErrorFlow.ngxTranslateNoImported, ErrorTypes.error, project);
        //         resultErrors.push(error);
        //     }
        // );
        //
        // if (resultErrors.length === 0) {
        //     // tslint:disable-next-line:no-any
        //     const projectDirectives: DirectiveSymbol[] = projectSymbols.getDirectives().filter((el: any) => el.symbol.filePath.indexOf("node_modules") === -1);
        //
        //     // RULE: Is `ngx-translate` module imported
        //     if (!!rules.ast && rules.ast.isNgxTranslateLintImported !== ErrorTypes.disable) {
        //         const isNgxTranslateImported: IRuleAst = new AstIsNgxTranslateImportedRule(projectDirectives);
        //         const isNgxTranslateResult: ResultErrorModel[] = isNgxTranslateImported.check(project, languagesKeys.keys);
        //         resultErrors.push(...isNgxTranslateResult);
        //     }
        //
        //     // RULE: translateService usage
        //     // if (rules.ast && rules.ast.isNgxTranslateLintImported !== ErrorTypes.disable) {
        //     //     const translateServiceRule: IRuleAst = new AstTranslateServiceRule(projectDirectives);
        //     //     const translateServiceResult: ResultErrorModel[] = translateServiceRule.check(project, languagesKeys.keys);
        //     //     resultErrors.push(...translateServiceResult);
        //     // }
        // }
        // return resultErrors;
//    }
}


export { NgxTranslateLint };
