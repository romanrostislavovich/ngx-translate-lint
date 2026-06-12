import * as path from 'node:path';
import { config } from './config';
import { ErrorFlow, ErrorTypes } from './enums';
import { IFetch, IRulesConfig } from './interface';
import { KeysUtils, parseJsonFile, saveJsonFile } from './utils';
import { FileLanguageModel, FileViewModel, KeyModel, LanguagesModel, ResultCliModel, ResultErrorModel } from './models';
import { AbsentViewKeysRule, EmptyKeysRule, MisprintRule, ZombieRule } from './rules';
import { KeyModelWithLanguages, LanguagesModelWithKey, ViewModelWithKey } from './models/KeyModelWithLanguages';
import { Http } from './utils/http';
import { ngxTranslateRegEx } from '../ngx-translate/regexp';

class NgxTranslateLint {
    public rules: IRulesConfig;
    public ignore?: string;
    public projectPath: string;
    public languagesPath: string;
    public fixZombiesKeys: boolean | undefined;
    public fetchSettings: IFetch | undefined;
    public toolsRegEx: string[] = [];

    constructor (
        projectPath: string = config.defaultValues.project,
        languagesPath: string = config.defaultValues.languages,
        ignore?: string,
        rulesConfig: IRulesConfig = config.defaultValues.rules,
        fixZombiesKeys?: boolean,
        fetchSettings?: IFetch,
        toolsRegEx: string[] = ngxTranslateRegEx,
    ) {
        this.ignore = ignore;
        this.rules = rulesConfig;
        this.projectPath = projectPath;
        this.languagesPath = languagesPath;
        this.fixZombiesKeys = fixZombiesKeys;
        this.fetchSettings = fetchSettings;
        this.toolsRegEx = toolsRegEx;
    }

    public async lint(maxWarning?: number): Promise<ResultCliModel> {
        if (!(this.projectPath && this.languagesPath)) {
            throw new Error(`Path to project or languages is incorrect`);
        }

        if (!('zombieKeys' in this.rules)) {
            throw new Error('Error config is incorrect');
        }

        const languageIsURL: boolean = this.languagesPath.includes('http') || this.languagesPath.includes('https') || typeof this.fetchSettings?.get === 'function';
        let languagesKeys: FileLanguageModel;

        if (languageIsURL) {
            const fileData: string = await Http.get(this.languagesPath, this.fetchSettings);
            const languagesPath: string = typeof this.fetchSettings?.get === 'function' ? 'translation api fetch' : this.languagesPath;
            languagesKeys = new FileLanguageModel(languagesPath, [], [], this.ignore, fileData, true).getKeysWithValue();
        } else {
            languagesKeys = new FileLanguageModel(this.languagesPath, [], [], this.ignore).getKeysWithValue();
        }

        const languagesKeysNames: string[] = languagesKeys.keys.flatMap((key: KeyModel) => key.name);
        const viewsRegExp: RegExp = KeysUtils.findKeysList(languagesKeysNames, this.rules.customRegExpToFindKeys, this.rules.deepSearch, this.toolsRegEx);

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

        if (this.rules.ignoredKeys?.length !== 0) {
            const ignoredRegexps: RegExp[] = this.rules.ignoredKeys.map(ignoredKey => new RegExp(ignoredKey, "i"));

            errors = errors.filter(errorKey => {
                const isIgnored: boolean = ignoredRegexps.some(rx => rx.test(errorKey.value));
                return !isIgnored;
            });
        }

        return new ResultCliModel(errors, maxWarning);
    }

    public getLanguages(): LanguagesModel[] {
        const languagesFiles: FileLanguageModel = new FileLanguageModel(this.languagesPath, [], [], this.ignore);
        const languagesKeys: FileLanguageModel = languagesFiles.getKeysWithValue();

        const languageMap:  Map<string, LanguagesModel> = new Map<string, LanguagesModel>();

        if (languagesKeys.keys.length === 0) {
            languagesFiles.files.forEach((filePath: string) => {
                const languageName: string = path.basename(filePath, '.json');
                const languageModel: LanguagesModel = new LanguagesModel(languageName);
                languageModel.path = filePath;
                languageMap.set(languageName, languageModel);
            });
        }

        languagesKeys.keys.forEach((key: KeyModel) => {
            key.languages.forEach((languagePath: string) => {
                const name: string = path.basename(languagePath);

                let language: LanguagesModel | undefined = languageMap.get(name);
                if (!language) {
                    language = new LanguagesModel(name);
                    language.path = languagePath;
                    languageMap.set(name, language);
                }
                language.keys.push(key);
            });
        });

        const result: LanguagesModel[] = Array.from(languageMap.values());

        if (this.projectPath) {
            const languagesKeysNames: string[] = languagesKeys.keys.flatMap((key: KeyModel) => key.name);
            const viewsRegExp: RegExp = KeysUtils.findKeysList(languagesKeysNames, this.rules.customRegExpToFindKeys, this.rules.deepSearch, this.toolsRegEx);
            const views: FileViewModel = new FileViewModel(this.projectPath, [], [], this.ignore).getKeys(viewsRegExp);

            result.forEach((language: LanguagesModel) => {
                const keyMap:  Map<string, KeyModel> = new Map(language.keys.map(k => [k.name, k]));

                views.keys.forEach((key: KeyModel) => {
                    const targetKey: KeyModel | undefined = keyMap.get(key.name);
                    if (targetKey) {
                        targetKey.views = key.views;
                    }
                });
            });
        }

        return result;
    }

    public getKeys(): KeyModelWithLanguages[] {
        const languagesKeys: LanguagesModel[] = this.getLanguages();

        const keyModelMap: Map<string, KeyModelWithLanguages> = new Map<string, KeyModelWithLanguages>();

        languagesKeys.forEach((language: LanguagesModel) => {
            language.keys.forEach((key: KeyModel) => {
                const viewsModels: ViewModelWithKey[] = key.views.map(x => new ViewModelWithKey(x));
                const languagesModel: LanguagesModelWithKey = new LanguagesModelWithKey(language.name, language.path, key.value);

                let currentKeyModel: KeyModelWithLanguages | undefined = keyModelMap.get(key.name);

                if (!currentKeyModel) {
                    currentKeyModel = new KeyModelWithLanguages(key.name, [languagesModel], viewsModels);
                    keyModelMap.set(key.name, currentKeyModel);
                } else {
                    currentKeyModel.languages.push(languagesModel);
                    currentKeyModel.views.push(...viewsModels);
                }
            });
        });

        return Array.from(keyModelMap.values());
    }

    private runRegExp(
        views: FileViewModel,
        languagesKeys: FileLanguageModel,
        rules: IRulesConfig = this.rules
    ): ResultErrorModel[] {
        const result: ResultErrorModel[] = [];

        if (rules.zombieKeys !== ErrorTypes.disable) {
            const ruleInstance: ZombieRule = new ZombieRule(this.rules.zombieKeys);
            result.push(...ruleInstance.check(views.keys, languagesKeys.keys));
        }

        if (rules.keysOnViews !== ErrorTypes.disable) {
            const ruleInstance: AbsentViewKeysRule = new AbsentViewKeysRule(this.rules.keysOnViews, languagesKeys.files);
            result.push(...ruleInstance.check(views.keys, languagesKeys.keys));
        }

        if (rules.misprintKeys !== ErrorTypes.disable) {
            const ruleInstance: MisprintRule = new MisprintRule(this.rules.misprintKeys, this.rules.misprintCoefficient, this.rules.ignoredMisprintKeys);
            result.push(...ruleInstance.check(result, languagesKeys.keys));
        }

        if (rules.emptyKeys !== ErrorTypes.disable) {
            const ruleInstance: EmptyKeysRule = new EmptyKeysRule(this.rules.emptyKeys);
            result.push(...ruleInstance.check(languagesKeys.keys));
        }

        if (!!this.fixZombiesKeys) {
            const filesAndKeysMap: Map<string, FileLanguageModel> = new Map<string, FileLanguageModel>();

            result.forEach((error) => {
                if (error.errorFlow === ErrorFlow.zombieKeys) {
                    let fileLanguage: FileLanguageModel | undefined = filesAndKeysMap.get(error.currentPath);
                    if (!fileLanguage) {
                        fileLanguage = new FileLanguageModel(error.currentPath, [], []);
                        filesAndKeysMap.set(error.currentPath, fileLanguage);
                    }
                    fileLanguage.keys.push(new KeyModel(error.value));
                }
            });

            filesAndKeysMap.forEach((languageFile: FileLanguageModel) => {
                const jsonData: any = parseJsonFile(languageFile.path);

                languageFile.keys.forEach((k) => {
                    delete jsonData[k.name];
                });

                saveJsonFile(jsonData, languageFile.path);
            });
        }

        return result;
    }
}

export { NgxTranslateLint };