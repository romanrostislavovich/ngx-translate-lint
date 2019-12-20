import chalk from "chalk";

import { ILogger } from 'src/core/interface';
import { ErrorTypes } from 'src/core/enums';

class StylishLogger implements ILogger {
    private logger: ILogger;
    private errorType: ErrorTypes;

    constructor(
        logger: ILogger,
        errorType: ErrorTypes = ErrorTypes.error,
    ) {
        this.logger = logger;
        this.errorType = errorType;
    }

    public error(message: string): void {
        this.logger.error(chalk.red(message));
    }

    public log(message: string): void {
        this.logger.log(chalk.yellow(message));
    }

    public printMessage(message: string, errorType: ErrorTypes = this.errorType): void {
        switch (errorType) {
            case ErrorTypes.error:
                this.error(message);
                break;
            case ErrorTypes.warning:
                this.log(message);
                break;
            default:
                this.log(message);
                break;
        }
    }
}

export { StylishLogger };
