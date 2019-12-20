import { chain, some } from 'lodash';

import { logger } from 'src/core/utils';
import { ErrorTypes, StatusCodes } from 'src/core/enums';
import { ResultModel } from './ResultModel';
import { ResultFileModel } from './ResultFileModel';
import { ResultErrorModel } from './ResultErrorModel';


class ResultLintModel {
    public errors: ResultErrorModel[] = [];

    public maxCountWarning: number = 0;
    public get hasErrors(): boolean {
        const result: boolean = some<ResultErrorModel[]>(this.errors, { 'errorType': ErrorTypes.error }) || this.isFullOfWarning;
        return result;
    }
    public get hasWarnings(): boolean {
        const result: boolean = some<ResultErrorModel[]>(this.errors, { 'errorType': ErrorTypes.warning });
        return result;
    }
    public get isFullOfWarning(): boolean {
        const warningsCount: number = (this.errors.filter((item: ResultErrorModel) => item.errorType === ErrorTypes.warning) || []).length;
        const result: boolean = this.maxCountWarning && this.maxCountWarning !== 0 && warningsCount !== 0 ? warningsCount > this.maxCountWarning : false;
        return result;
    }
    public get exitCode(): StatusCodes {
        return this.hasErrors || this.isFullOfWarning ? StatusCodes.error : StatusCodes.successful;
    }

    constructor(
        errors: ResultErrorModel[] = [],
        maxCountWarning: number = 0,
    ) {
        this.errors = errors;
        this.maxCountWarning = maxCountWarning;
    }

    private getResultFiles(): ResultFileModel[] {
        const resultFiles: ResultFileModel[] = chain<ResultErrorModel>(this.errors)
            .groupBy("currentPath")
            .map((dictionary: ResultErrorModel[], key: string) => {
                let clearDictionary: ResultErrorModel[] = dictionary;
                const hasError: boolean = some<ResultErrorModel[]>(dictionary, { 'errorType': ErrorTypes.error });
                const errorType: ErrorTypes = hasError || this.isFullOfWarning ? ErrorTypes.error : ErrorTypes.warning;
                if (this.isFullOfWarning) {
                    clearDictionary = dictionary.map((item: ResultErrorModel) => {
                        item.errorType = ErrorTypes.error;
                        return item;
                    });
                }
                return new ResultFileModel(key, clearDictionary, errorType);
            })
            .value();
        return resultFiles;
    }

    public getResultModel(): ResultModel {
        const resultFiles: ResultFileModel[] = this.getResultFiles();
        const resultModel: ResultModel = new ResultModel(resultFiles, this.hasErrors, this.hasWarnings, logger);
        return resultModel;
    }
}

export { ResultLintModel };
