import { isArray } from 'lodash';

import { ILogger } from "../../core/interface";
import { ErrorTypes } from "../../core/enums";
import { StylishLogger } from '../../core/models/StylishLogger';
import { ResultFileModel } from "../../core/models/results/ResultFileModel";
import { ResultErrorModel } from "../../core/models/results/ResultErrorModel";

class ResultModel extends StylishLogger {
    public files: ResultFileModel[];
    public hasError: boolean;
    public hasWarning: boolean;
    public readonly message: string = `Find missing translation keys in project`;

    constructor(
        files: ResultFileModel[] = [],
        hasError: boolean = false,
        hasWarning: boolean = false,
        logger: ILogger = console,
    ) {
        super(logger, hasError ? ErrorTypes.error : ErrorTypes.warning);
        this.files = files;
        this.hasError = hasError;
        this.hasWarning = hasWarning;
    }

    public printResult(): void {
        this.printMessage(`${this.message}\n`);

        this.files.forEach((file: ResultFileModel) => {
            this.printMessage(`\n\t${file.message}\n`, file.errorType);
            file.errors.forEach((error: ResultErrorModel) => {
                isArray(error.message)
                    ? (error.message as string[]).map((message: string) => {
                        this.printMessage(`\t\t${message}\n`, error.errorType);
                    })
                    : this.printMessage(`\t\t${error.message}\n`, error.errorType);
            });
        });
    }
}

export { ResultModel };
