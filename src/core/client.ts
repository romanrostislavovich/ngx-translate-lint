import {flatMap} from 'lodash';

import {config} from './config';
import {ErrorTypes} from './enums';
import {IRulesConfig} from './interface';
import {AbsentViewKeysRule, ZombieRule} from './rules';
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
        this.rules = rulesConfig;
        this.ignore = ignore;
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
        const viewsRegExp: RegExp = config.findKeysList(languagesKeysNames);
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
        const cliResult: ResultCliModel = new ResultCliModel(errors, maxWarning)
        return cliResult;
    }
}

export { NgxTranslateLint };
