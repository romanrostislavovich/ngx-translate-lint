import { NgxTranslateLint } from './client';
import { ErrorTypes, ErrorFlow } from './enums';
import { IRulesConfig, IAppConfig, IRule, IValidationMessage, ILogger } from './interface';
import {
    KeyModel,
    ResultModel,
    ResultFileModel,
    ResultErrorModel,
    FileModel,
    FileViewModel,
    FileLanguageModel,
    ErrorModel,
    FatalErrorModel
} from './models';

// tslint:disable-next-line: no-default-export
export default NgxTranslateLint;
export {
    NgxTranslateLint,
    ErrorTypes, ErrorFlow,
    IRulesConfig, IAppConfig, IRule, IValidationMessage, ILogger,
    KeyModel,
    ResultModel,
    ResultFileModel,
    ResultErrorModel,
    FileModel,
    FileViewModel,
    FileLanguageModel,
    ErrorModel,
    FatalErrorModel
};
