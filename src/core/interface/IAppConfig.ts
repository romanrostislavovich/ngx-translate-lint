import { IRulesConfig } from './IRulesConfig';

interface IDefaultValues {
    rules: IRulesConfig;
    project: string;
    languages: string;
    fixZombiesKeys?: boolean;
}
interface IAppConfig {
    defaultValues: IDefaultValues;
}

export { IAppConfig };
