import { flatMap, omit } from 'lodash';
import * as path from 'node:path';
import { config } from './config';
import { ErrorFlow, ErrorTypes } from './enums';
import { IRulesConfig } from './interface';
import { getPackageJsonPath, KeysUtils, parseJsonFile, saveJsonFile } from './utils';
import { FileLanguageModel, FileViewModel, KeyModel, LanguagesModel, ResultCliModel, ResultErrorModel } from './models';
import { AbsentViewKeysRule, EmptyKeysRule, MisprintRule, ZombieRule } from './rules';
import { KeyModelWithLanguages, LanguagesModelWithKey, ViewModelWithKey } from './models/KeyModelWithLanguages';
import { Http } from './utils/http';

class NgxTranslateLint {
    public rules: IRulesConfig;
    public ignore?: string;
    public projectPath: string;
    public languagesPath: string;
    public fixZombiesKeys: boolean | undefined;

    constructor (
        projectPath: string = config.defaultValues.project,
        languagesPath: string = config.defaultValues.languages,
        ignore?: string,
        rulesConfig: IRulesConfig = config.defaultValues.rules,
        fixZombiesKeys?: boolean,
    ) {
        this.ignore = ignore;
        this.rules = rulesConfig;
        this.projectPath = projectPath;
        this.languagesPath = languagesPath;
        this.fixZombiesKeys = fixZombiesKeys;
    }

    public async lint(maxWarning?: number): Promise<ResultCliModel> {
        if (!(this.projectPath && this.languagesPath)) {
            throw new Error(`Path to project or languages is incorrect`);
        }

        if (!('zombieKeys' in this.rules)) {
            throw new Error('Error config is incorrect');
        }

        const languageIsURL: boolean = this.languagesPath.includes('http') || this.languagesPath.includes('https');
        let languagesKeys: FileLanguageModel;
        if (languageIsURL) {
            const fileData: string = await Http.get(this.languagesPath);
            languagesKeys = new FileLanguageModel(this.languagesPath, [], [], this.ignore, fileData, true).getKeysWithValue();
        } else {
            languagesKeys = new FileLanguageModel(this.languagesPath, [], [], this.ignore).getKeysWithValue();
        }

        const languagesKeysNames: string[] = flatMap(languagesKeys.keys, (key: KeyModel) => key.name);
        const viewsRegExp: RegExp = KeysUtils.findKeysList(languagesKeysNames, this.rules.customRegExpToFindKeys, this.rules.deepSearch);

        const views: FileViewModel = new FileViewModel(this.projectPath, [], [], this.ignore).getKeys(viewsRegExp);

        let errors: ResultErrorModel[] = [];

        if (
            this.rules.zombieKeys !== ErrorTypes.disable ||
            this.rules.keysOnViews !== ErrorTypes.disable ||
            this.rules.misprintKeys !== ErrorTypes.disable ||
            this.rules.emptyKeys !== ErrorTypes.disable ||
            !!this.fixZombiesKeys
        ) {
            const regExpResult: ResultErrorModel[] = this.runRegExp(views, languagesKeys);
            errors.push(...regExpResult);
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

        if (!!this.fixZombiesKeys) {
            const allZombiesKeys: ResultErrorModel[] = result.filter((error) => {
                return error.errorFlow === ErrorFlow.zombieKeys;
            });

            const filesAndKeys: FileLanguageModel[] = allZombiesKeys.reduce((acum: FileLanguageModel[], item: ResultErrorModel) => {
                const existingFileLanguage: FileLanguageModel | undefined = acum.find((x) => x.path === item.currentPath) ;
                if (!!existingFileLanguage) {
                    existingFileLanguage.keys.push(new KeyModel(item.value));
                }  else {
                    const newFileLanguage: FileLanguageModel = new FileLanguageModel(item.currentPath, [], [new KeyModel(item.value)]);
                    acum.push(newFileLanguage);
                }
                return acum;
            }, []);

            filesAndKeys.forEach((languageFile: FileLanguageModel) => {
                // tslint:disable-next-line:no-any
                const jsonData: any = parseJsonFile(languageFile.path);
                const keysArray: string[] = languageFile.keys.map((x) => x.name);
                // tslint:disable-next-line:no-any
                const resultData: any  = omit(jsonData, keysArray);
                saveJsonFile(resultData, languageFile.path);
            });
        }

        return result;
    }
}

export { NgxTranslateLint };
