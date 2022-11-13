import { isArray } from 'lodash';

import { ResultFileModel } from './ResultFileModel';
import { ResultErrorModel } from './ResultErrorModel';
import { ErrorFlow, ErrorTypes } from '../../enums';
import { ILogger } from '../../interface';
import { StylishLogger } from '../StylishLogger';
import { ResultCliModel } from './ResultCliModel';

class ResultModel extends StylishLogger {
    public cli: ResultCliModel;
    public files: ResultFileModel[];
    public hasError: boolean;
    public hasWarning: boolean;
    public readonly message: string = `Find missing translation keys in project`;

    constructor(
        cliModel: ResultCliModel,
        files: ResultFileModel[] = [],
        hasError: boolean = false,
        hasWarning: boolean = false,
        logger: ILogger = console,
    ) {
        super(logger, hasError ? ErrorTypes.error : ErrorTypes.warning);
        this.cli = cliModel;
        this.files = files;
        this.hasError = hasError;
        this.hasWarning = hasWarning;
    }

    public printResult(): void {
        if (this.files.length !== 0) {
            this.printMessage(`${this.message}\n`);
            this.files.forEach((file: ResultFileModel) => {
                this.printMessage(`\n\t${file.message()}\n`, file.errorType);
                file.errors.forEach((error: ResultErrorModel) => {
                     isArray(error.message())
                         ? (error.message() as string[]).map((message: string) => {
                             this.printMessage(`\t\t${message}\n`, error.errorType);
                         })
                         : this.printMessage(`\t\t${error.message()}\n`, error.errorType);
                });
            });
        }
    }

    public printSummery(): void {
        if (this.cli.hasWarnings() || this.cli.hasErrors()) {
            const totalErrorType: ErrorTypes = this.cli.isFullOfWarning() || this.cli.hasErrors() ? ErrorTypes.error : ErrorTypes.warning;
            const emptyKeys: ResultErrorModel[] = this.cli.errors.filter((x) => x.errorFlow === ErrorFlow.emptyKeys);
            const zombieKeys: ResultErrorModel[] = this.cli.errors.filter((x) => x.errorFlow === ErrorFlow.zombieKeys);
            const keysOnViews: ResultErrorModel[] = this.cli.errors.filter((x) => x.errorFlow === ErrorFlow.keysOnViews);
            const misprintKeys: ResultErrorModel[] = this.cli.errors.filter((x) => x.errorFlow === ErrorFlow.misprintKeys);

            this.printMessage(`\nFind following errors:`, totalErrorType);
            
            if (emptyKeys.length !== 0) {
                const errorType:ErrorTypes = this.cli.isFullOfWarning() ? ErrorTypes.error : emptyKeys[0].errorType;
                this.printMessage(`Empty Keys: \t ${emptyKeys.length}`,errorType);
            }

            if (zombieKeys.length !== 0) {
                const errorType:ErrorTypes = this.cli.isFullOfWarning() ? ErrorTypes.error : zombieKeys[0].errorType;
                this.printMessage(`Zombie Keys: \t ${zombieKeys.length}`, errorType);
            }

            if (keysOnViews.length !== 0) {
                const errorType:ErrorTypes = this.cli.isFullOfWarning() ? ErrorTypes.error : keysOnViews[0].errorType;
                this.printMessage(`Key On Views: \t ${keysOnViews.length}`, errorType);
            }


            if (misprintKeys.length !== 0) {
                const errorType:ErrorTypes = this.cli.isFullOfWarning() ? ErrorTypes.error : misprintKeys[0].errorType;
                this.printMessage(`Misprint Keys: \t ${misprintKeys.length}`, errorType);
            }


            this.printMessage(`--------------------`, totalErrorType);
            this.printMessage(`TOTAL: \t\t ${this.cli.countWarnings() + this.cli.countErrors()}`, totalErrorType);
            this.printMessage(`\n`);
        }
    }
}

export { ResultModel };
