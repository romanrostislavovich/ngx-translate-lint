import { flatMap } from 'lodash';

import { config } from './config';
import { ErrorTypes } from './enums';
import { IRulesConfig } from './interface';
import { ZombieRule, AbsentViewKeysRule } from './rules';
import { ResultErrorModel, FileLanguageModel, KeyModel, FileViewModel } from './models';

class NgxTranslateLint {
    public projectPath: string;
    public languagesPath: string;
    public rules: IRulesConfig;

    constructor (
        projectPath: string = config.defaultValues.projectPath,
        languagesPath: string = config.defaultValues.languagesPath,
        rulesConfig: IRulesConfig = config.defaultValues.rules,
    ) {
        this.languagesPath = languagesPath;
        this.projectPath = projectPath;
        this.rules = rulesConfig;
    }

    public lint(): ResultErrorModel[] {
        if (!(this.projectPath && this.languagesPath)) {
            throw new Error(`Path to project or languages is incorrect`);
        }

        if (!('zombieKeys' in this.rules)) {
            throw new Error('Error config is incorrect');
        }

        const languagesKeys: FileLanguageModel = new FileLanguageModel(this.languagesPath).getKeys();
        const languagesKeysNames: string[] = flatMap(languagesKeys.keys, (key: KeyModel) => key.name);
        const viewsRegExp: RegExp = config.findKeysList(languagesKeysNames);
        const views: FileViewModel = new FileViewModel(this.projectPath).getKeys(viewsRegExp);

        const result: ResultErrorModel[] = [];

        // TODO: RL: Refactor this
        if (this.rules.zombieKeys !== ErrorTypes.disable) {
            const ruleInstance: ZombieRule = new ZombieRule(this.rules.zombieKeys);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(views.keys, languagesKeys.keys);
            result.push(...ruleResult);
        }

        if (this.rules.keysOnViews !== ErrorTypes.disable) {
            const ruleInstance: AbsentViewKeysRule = new AbsentViewKeysRule(this.rules.keysOnViews, languagesKeys.files);
            const ruleResult: ResultErrorModel[] = ruleInstance.check(views.keys, languagesKeys.keys);
            result.push(...ruleResult);
        }

        return result;
    }
}

export { NgxTranslateLint };
