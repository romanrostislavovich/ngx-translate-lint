import { logger } from '../../utils';
import { ResultModel } from './ResultModel';
import { ResultFileModel } from './ResultFileModel';
import { ResultErrorModel } from './ResultErrorModel';
import { ErrorFlow, ErrorTypes, StatusCodes } from '../../enums';

class ResultCliModel {
    public errors: ResultErrorModel[] = [];
    public maxCountWarning: number = 0;

    private _warningsCount: number = 0;
    private _errorsCount: number = 0;
    private _misprintCount: number = 0;
    private _emptyKeys: ResultErrorModel[] = [];

    constructor(
        errors: ResultErrorModel[] = [],
        maxCountWarning: number = 0,
    ) {
        this.errors = errors;
        this.maxCountWarning = +maxCountWarning;

        for (const error of this.errors) {
            if (error.errorType === ErrorTypes.warning) {
                this._warningsCount++;
            }
            if (error.errorType === ErrorTypes.error) {
                this._errorsCount++;
            }
            if (error.errorFlow === ErrorFlow.misprintKeys) {
                this._misprintCount++;
            }
            if (error.errorFlow === ErrorFlow.emptyKeys) {
                this._emptyKeys.push(error);
            }
        }
    }

    public countWarnings(): number {
        return this._warningsCount;
    }

    public hasWarnings(): boolean {
        return this._warningsCount > 0;
    }

    public isFullOfWarning(): boolean {
        return this.maxCountWarning > 0 && this.hasWarnings()
            ? this._warningsCount > this.maxCountWarning
            : false;
    }

    public countErrors(): number {
        return this._errorsCount;
    }

    public hasErrors(): boolean {
        return this._errorsCount > 0 || this.isFullOfWarning();
    }

    public countMisprint(): number {
        return this._misprintCount;
    }

    public hasMisprint(): boolean {
        return this._misprintCount > 0;
    }

    public getEmptyKeys(): ResultErrorModel[] {
        return this._emptyKeys;
    }

    public countEmptyKeys(): number {
        return this._emptyKeys.length;
    }

    public hasEmptyKeys(): boolean {
        return this._emptyKeys.length > 0;
    }

    public exitCode(): StatusCodes {
        return this.hasErrors() ? StatusCodes.error : StatusCodes.successful;
    }

    private getResultFiles(): ResultFileModel[] {
        const grouped:  Map<string, ResultErrorModel[]> = new Map<string, ResultErrorModel[]>();


        const isFullWarnings: boolean = this.isFullOfWarning();

        for (const error of this.errors) {
            let list: ResultErrorModel[] | undefined = grouped.get(error.currentPath);
            if (!list) {
                list = [];
                grouped.set(error.currentPath, list);
            }

            if (isFullWarnings) {
                error.errorType = ErrorTypes.error;
            }

            list.push(error);
        }

        const resultFiles: ResultFileModel[] = [];

        for (const [path, dictionary] of grouped.entries()) {
            const hasError: boolean = dictionary.some((item) => item.errorType === ErrorTypes.error);
            const errorType: ErrorTypes.error | ErrorTypes.warning = hasError || isFullWarnings ? ErrorTypes.error : ErrorTypes.warning;

            resultFiles.push(new ResultFileModel(path, dictionary, errorType));
        }

        return resultFiles;
    }

    public getResultModel(): ResultModel {
        const resultFiles: ResultFileModel[] = this.getResultFiles();
        return new ResultModel(this, resultFiles, this.hasErrors(), this.hasWarnings(), logger);
    }
}

export { ResultCliModel };