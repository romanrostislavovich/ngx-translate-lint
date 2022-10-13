import { chain, some } from 'lodash';

import { logger } from '../../utils';
import { ResultModel } from './ResultModel';
import { ResultFileModel } from './ResultFileModel';
import { ResultErrorModel } from './ResultErrorModel';
import { ErrorFlow, ErrorTypes, StatusCodes } from '../../enums';

class ResultCliModel {
    public errors: ResultErrorModel[] = [];

    public maxCountWarning: number = 0;
    public countWarnings(): number {
        const result: number = (this.errors.filter((item: ResultErrorModel) => item.errorType === ErrorTypes.warning) || []).length;
        return result;
    }

    public hasWarnings(): boolean {
        const result: boolean = this.countWarnings() > 0;
        return result;
    }

    public isFullOfWarning(): boolean {
        const result: boolean = this.maxCountWarning && this.maxCountWarning !== 0 && this.hasWarnings ? this.countWarnings() > this.maxCountWarning : false;
        return result;
    }

    public countErrors(): number {
        const result: number = (this.errors.filter((item: ResultErrorModel) => item.errorType === ErrorTypes.error) || []).length;
        return result;
    }

    public hasErrors(): boolean {
        const result: boolean =  this.countErrors() > 0 || this.isFullOfWarning();
        return result;
    }

    public countMisprint(): number {
        const misprintCount: number = (this.errors.filter((item: ResultErrorModel) => item.errorFlow === ErrorFlow.misprint) || []).length;
        return misprintCount;
    }

    public hasMisprint(): boolean {
        const result: boolean = this.countMisprint() > 0;
        return result;
    }

    public getEmptyKeys(): ResultErrorModel[] {
        const result: ResultErrorModel[] = (this.errors.filter((item: ResultErrorModel) => item.errorFlow === ErrorFlow.emptyKeys) || []);
        return result;
    }

    public countEmptyKeys(): number {
        const result: number = (this.errors.filter((item: ResultErrorModel) => item.errorFlow === ErrorFlow.emptyKeys) || []).length;
        return result;
    }

    public hasEmptyKeys(): boolean {
        const result: boolean = this.countEmptyKeys() > 0;
        return result;
    }

    public exitCode(): StatusCodes {
        return this.hasErrors() ? StatusCodes.error : StatusCodes.successful;
    }

    constructor(
        errors: ResultErrorModel[] = [],
        maxCountWarning: number = 0,
    ) {
        this.errors = errors;
        this.maxCountWarning = +maxCountWarning;
    }

    private getResultFiles(): ResultFileModel[] {
        const resultFiles: ResultFileModel[] = chain<ResultErrorModel>(this.errors)
            .groupBy("currentPath")
            .map((dictionary: ResultErrorModel[], key: string) => {
                let clearDictionary: ResultErrorModel[] = dictionary;
                const hasError: boolean = some<ResultErrorModel[]>(dictionary, { 'errorType': ErrorTypes.error });
                const errorType: ErrorTypes = hasError || this.isFullOfWarning ? ErrorTypes.error : ErrorTypes.warning;
                if (this.isFullOfWarning()) {
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
        const resultModel: ResultModel = new ResultModel(resultFiles, this.hasErrors(), this.hasWarnings(), logger);
        return resultModel;
    }
}

export { ResultCliModel };
