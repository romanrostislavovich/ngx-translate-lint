import { IRulesConfig } from './IRulesConfig';

interface IDefaultValues {
    rules: IRulesConfig;
    projectPath: string;
    languagesPath: string;
}
interface IAppConfig {
    defaultValues: IDefaultValues;
}

export { IAppConfig };
