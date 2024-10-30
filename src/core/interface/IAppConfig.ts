import { IRulesConfig } from './IRulesConfig';

interface IDefaultValues {
    rules: IRulesConfig;
    projectPath: string;
    languagesPath: string;
    fixZombiesKeys?: boolean;
}
interface IAppConfig {
    defaultValues: IDefaultValues;
}

export { IAppConfig };
