import { isArray } from 'lodash';
import { IValidationMessage } from '../../interface';
import { ErrorFlow, ErrorTypes } from '../../enums';

class ResultErrorModel implements IValidationMessage  {
    public value: string;
    public errorFlow: ErrorFlow;
    public errorType: ErrorTypes;
    public absentedPath?: string | string[];
    public currentPath: string;
    public suggestions: string[];

    constructor(
        value: string,
        errorFlow: ErrorFlow = ErrorFlow.views,
        errorType: ErrorTypes = ErrorTypes.error,
        currentPath: string,
        absentedPath?: string | string[],
        suggestions: string[] = [],
    ) {
        this.value = value;
        this.errorFlow = errorFlow;
        this.errorType = errorType;
        this.currentPath = currentPath;
        this.absentedPath = absentedPath;
        this.suggestions = suggestions;
    }

    get message(): string | string[] | null {
        let message: string | string[] | null = null;
        switch (this.errorFlow) {
            case ErrorFlow.views:
                message = isArray(this.absentedPath)
                    ? this.absentedPath.map((path: string) => `Key: '${this.value}' doesn't exist in '${path}'`)
                    : `Key: '${this.value}' doesn't exist in '${this.absentedPath}'`;
                break;
            case ErrorFlow.zombie:
                message = `Key: '${this.value}' doesn't exist in project'`;
                break;
            case ErrorFlow.misprint:
               message = this.suggestions.reduce((accum: string[], item: string) => {
                   accum.push(`Possible match: ${item} for key ${this.value}`);
                   return accum;
                }, []);
                break;
            case ErrorFlow.ngxTranslateNoImported:
                message = `'ngx-translate' module doesn't imported on your project`;
                break;
            default:
                message = 'Unknown error please write to the author';
                break;
        }
        return message;
    }
}

export { ResultErrorModel };
