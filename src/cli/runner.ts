import chalk from 'chalk';
import { chain, some } from 'lodash';

import { StatusCodes } from "./enums";
import {
    ErrorTypes,
    FatalErrorModel,
    ILogger,
    IRulesConfig,
    NgxTranslateLint,
    ResultErrorModel,
    ResultFileModel,
} from "./../core";
import { ResultModel } from "./models/ResultModel";


const logger: ILogger = {
    log(m: string): void {
        process.stdout.write(m);
    },
    error(m: string): void {
        process.stderr.write(m);
    },
};

function runLint(
    project: string,
    languages: string,
    zombies?: ErrorTypes,
    views?: ErrorTypes,
    ignore?: string,
    maxWarning?: number,
): void {
    try {
        const errorConfig: IRulesConfig = {
            keysOnViews: views || ErrorTypes.error,
            zombieKeys: zombies || ErrorTypes.warning
        };
        const validationModel: NgxTranslateLint = new NgxTranslateLint(project, languages, ignore, errorConfig);
        const validationResult: ResultErrorModel[] = validationModel.lint();
        const hasError: boolean = some<ResultErrorModel[]>(validationResult, { 'errorType': ErrorTypes.error });
        const hasWarning: boolean = some<ResultErrorModel[]>(validationResult, { 'errorType': ErrorTypes.warning });
        const countWarning: number = (validationResult.filter((item: ResultErrorModel) => item.errorType === ErrorTypes.warning) || []).length;
        const isFullOfWarning: boolean = maxWarning && maxWarning !== 0 && countWarning !== 0
            ? countWarning > (maxWarning as number)
            : false;

        const resultFiles: ResultFileModel[] = chain<ResultErrorModel>(validationResult)
            .groupBy("currentPath")
            .map((dictionary: ResultErrorModel[], key: string) => {
                let clearDictionary: ResultErrorModel[] = dictionary;
                const hasError: boolean = some<ResultErrorModel[]>(dictionary, { 'errorType': ErrorTypes.error });
                const errorType: ErrorTypes = hasError || isFullOfWarning ? ErrorTypes.error : ErrorTypes.warning;
                if (isFullOfWarning) {
                    clearDictionary = dictionary.map((item: ResultErrorModel) => {
                        item.errorType = ErrorTypes.error;
                        return item;
                    });
                }
                return new ResultFileModel(key, clearDictionary, errorType);
            })
            .value();

        const result: ResultModel = new ResultModel(resultFiles, hasError || isFullOfWarning, hasWarning, logger);
        result.printResult();

        process.exitCode = hasError || isFullOfWarning? StatusCodes.error : StatusCodes.succefull;
        if (hasError || isFullOfWarning) {
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
