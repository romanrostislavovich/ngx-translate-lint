import { IRulesConfig } from './IRulesConfig';

interface IDefaultValues {
    rules: IRulesConfig;
    projectPath: string;
    languagesPath: string;
}
interface IAppConfig {
    findKeysList(keys: string[]): RegExp;
    defaultValues: IDefaultValues;
}

export { IAppConfig };
