import chalk from 'chalk';
import { some, chain } from 'lodash';

import { StatusCodes } from "./enums";
import {
    ErrorTypes,
    ResultModel,
    IRulesConfig,
    ResultFileModel,
    ResultErrorModel,
    NgxTranslateLint,
    FatalErrorModel,
    ILogger,
} from "./../core";


const logger: ILogger = {
    log(m: string): void {
        process.stdout.write(m);
    },
    error(m: string): void {
        process.stderr.write(m);
    },
};

function runLint(project: string, languages: string, zombies?: ErrorTypes, views?: ErrorTypes, ignore?: string): void {
    try {
        const errorConfig: IRulesConfig = {
            keysOnViews: views || ErrorTypes.error,
            zombieKeys: zombies || ErrorTypes.warning
        };
        const validationModel: NgxTranslateLint = new NgxTranslateLint(project, languages, ignore, errorConfig);
        const validationResult: ResultErrorModel[] = validationModel.lint();
        const hasError: boolean = some<ResultErrorModel[]>(validationResult, { 'errorType': ErrorTypes.error });
        const hasWarning: boolean = some<ResultErrorModel[]>(validationResult, { 'errorType': ErrorTypes.warning });

        const resultFiles: ResultFileModel[] = chain<ResultErrorModel>(validationResult)
            .groupBy("currentPath")
            .map((dictionary: ResultErrorModel[], key: string) => {
                const hasError: boolean = some<ResultErrorModel[]>(dictionary, { 'errorType': ErrorTypes.error });
                const errorType: ErrorTypes = hasError ? ErrorTypes.error : ErrorTypes.warning;
                return new ResultFileModel(key, dictionary, errorType);
            })
            .value();

        const result: ResultModel = new ResultModel(resultFiles, hasError, hasWarning, logger);
        result.printResult();

        process.exitCode = hasError ? StatusCodes.error : StatusCodes.succefull;
        if (hasError) {
            throw new FatalErrorModel(chalk.red(result.message));
        }
    } catch (error) {
        // tslint:disable-next-line: no-console
        console.error(error);
        process.exitCode =  StatusCodes.crash;
    } finally {
        process.exit();
    }
}

export { runLint };
