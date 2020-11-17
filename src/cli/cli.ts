#!/usr/bin/env node
import commander from 'commander';

import { OptionModel } from './models';
import {
    ErrorTypes,
    FatalErrorModel, IAstRulesConfig,
    IRulesConfig,
    NgxTranslateLint,
    ResultCliModel,
    ResultModel,
    StatusCodes
} from "./../core";

import { config } from './../core/config';
import { OptionsLongNames } from './enums';
import chalk from 'chalk';
import { parseJsonFile } from './utils';

const name: string = 'ngx-translate-lint';
// tslint:disable-next-line:no-any
const docs: any = {
    name,
    usage: '[options]',
    description: 'Simple CLI tools for check `ngx-translate` keys in app',
    examples: `

Examples:

    $ ${name} -p ${config.defaultValues.projectPath} -l ${config.defaultValues.languagesPath}
    $ ${name} -p ${config.defaultValues.projectPath} -z ${ErrorTypes.disable} -v ${ErrorTypes.error}
    $ ${name} -p ${config.defaultValues.projectPath} -i ./src/assets/i18n/EN-us.json, ./src/app/app.*.{json}

`
};

class Cli {
    private cliClient: commander.CommanderStatic = commander;
    private cliOptions: OptionModel[] = [];

    constructor(options: OptionModel[]) {
        this.cliOptions = options;
    }

    public static run(options: OptionModel[]): void {
        const cli: Cli = new Cli(options);
        cli.init();
        cli.parse();
        cli.runCli();
    }

    public init(options: OptionModel[] = this.cliOptions): void {
        options.forEach((option: OptionModel) => {
            const optionFlag: string = option.getFlag();
            const optionDescription: string = option.getDescription();
            const optionDefaultValue: string | ErrorTypes | undefined = option.default;
            this.cliClient.option(optionFlag, optionDescription, optionDefaultValue);
        });

        this.cliClient
            .name(docs.name)
            .usage(docs.usage)
            .description(docs.description)
            .on(`--${OptionsLongNames.help}`, () => {
                // tslint:disable-next-line:no-console
                console.log(docs.examples);
            });
    }

    public runCli(): void {
        try {
            // tslint:disable-next-line:no-any
            const options: any = this.cliClient.config ? parseJsonFile(this.cliClient.config) : this.cliClient;
            if (options.project && options.languages) {
                this.runLint(
                    options.tsconfig, options.project, options.languages, options.zombies,
                    options.views, options.ignore, options.maxWarning, options.misprint,
                    options.misprintCoefficient, options.ast,
                );
            } else {
                const cliHasError: boolean = this.validate();
                if (cliHasError) {
                    process.exit(StatusCodes.crash);
                } else {
                    this.cliClient.help();
                }
            }
        } catch (error) {
            // tslint:disable-next-line: no-console
            console.error(error);
            process.exitCode = StatusCodes.crash;
        } finally {
            process.exit();
        }
    }

    public parse(): void {
        this.cliClient.parse(process.argv);
    }

    private validate(): boolean {
        const requiredOptions: OptionModel[] = this.cliOptions.filter((option: OptionModel) => option.required);
        const missingRequiredOption: boolean = requiredOptions.reduce((accum: boolean, option: OptionModel) => {
            if (!this.cliClient[String(option.longName)]) {
                accum = false;
                // tslint:disable-next-line: no-console
                console.error(`Missing required argument: ${option.getFlag()}`);
            }
            return accum;
        }, false);

        return missingRequiredOption;
    }

    public runLint(
        tsconfig: string,
        project: string,
        languages: string,
        zombies?: ErrorTypes,
        views?: ErrorTypes,
        ignore?: string,
        maxWarning: number = 1,
        misprint?: ErrorTypes,
        misprintCoefficient: number = 0.9,
        ast?: IAstRulesConfig,
    ): void {
            const errorConfig: IRulesConfig = {
                keysOnViews: views || ErrorTypes.error,
                zombieKeys: zombies || ErrorTypes.warning,
                misprint: misprint || ErrorTypes.warning,
                maxWarning,
                misprintCoefficient,
                ast,
            };
            const validationModel: NgxTranslateLint = new NgxTranslateLint(project, languages, ignore, errorConfig);
            const resultCliModel: ResultCliModel = validationModel.lint(maxWarning);
            const resultModel: ResultModel = resultCliModel.getResultModel();
            resultModel.printResult();

            process.exitCode = resultCliModel.exitCode;

            if (resultModel.hasError) {
                throw new FatalErrorModel(chalk.red(resultModel.message));
            }
    }
}

export { Cli };
