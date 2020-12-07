import { ErrorTypes } from "../../enums";
import { ResultErrorModel } from "./ResultErrorModel";
import { IValidationMessage } from "./../../interface";

class ResultFileModel implements  IValidationMessage {
    public value?: string;
    public errors: ResultErrorModel[];
    public errorType: ErrorTypes;

    constructor(
        value?: string,
        errors: ResultErrorModel[] = [],
        errorType: ErrorTypes = ErrorTypes.error
    ) {
        this.value = value;
        this.errors = errors;
        this.errorType = errorType;
    }

    public message(): string | string[] | null {
        return this.value ? `Following file ${this.value} have errors:` : `Founded errors without file`;
    }
}

export { ResultFileModel };
