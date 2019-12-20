import chalk from 'chalk';

import { StatusCodes } from "./enums";
import {
    ErrorTypes,
    FatalErrorModel,
    IRulesConfig,
    NgxTranslateLint,
    ResultErrorModel,
    ResultLintModel,
} from "./../core";
import { ResultModel } from "./models/ResultModel";

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
        const resultLintModel: ResultLintModel = new ResultLintModel(validationResult, maxWarning);
        const resultModel: ResultModel = resultLintModel.getResultModel()
        resultModel.printResult();

        process.exitCode = resultLintModel.exitCode;
        if (resultModel.hasError) {
            throw new FatalErrorModel(chalk.red(resultModel.message));
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
