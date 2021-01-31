import { IRulesConfig } from './IRulesConfig';

interface IDefaultValues {
    rules: IRulesConfig;
    projectPath: string;
    languagesPath: string;
    tsconfigPath: string;
}
interface IAppConfig {
    defaultValues: IDefaultValues;
}

export { IAppConfig };
