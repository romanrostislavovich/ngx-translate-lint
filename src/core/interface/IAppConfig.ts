import { IRulesConfig } from './IRulesConfig';

interface IDefaultValues {
    ast: string;
    rules: IRulesConfig;
    projectPath: string;
    languagesPath: string;
}
interface IAppConfig {
    defaultValues: IDefaultValues;
}

export { IAppConfig };
