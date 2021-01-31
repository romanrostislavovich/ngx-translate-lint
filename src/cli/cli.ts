#!/usr/bin/env node
import commander from 'commander';

import { OptionModel } from './models';
import {
    ErrorTypes,
    FatalErrorModel,
    IRulesAstConfig,
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
            const projectPath: string = options.project;
            const languagePath: string = options.languages;
            const tsConfigPath: string = options.tsConfigPath;
            const optionIgnore: string = options.ignore || options.rules.ignore;
            const optionMisprint: ErrorTypes = options.misprint || options.rules.misprint;
            const optionViewsRule: ErrorTypes = options.views || options.rules.views;
            const optionMaxWarning: number =  options.maxWarning || options.rules.maxWarning;
            const optionZombiesRule: ErrorTypes = options.zombies || options.rules.zombies;
            const optionIgnoredKeys: string[] = options.ignoredKeys || options.rules.ignoredKeys;
            const optionMisprintCoefficient: number = options.misprintCoefficient || options.rules.misprintCoefficient;
            const optionIgnoredMisprintKeys: string[] = options.ignoredMisprintKeys || options.rules.ignoredMisprintKeys;
            const optionAstRules: IRulesAstConfig = options.ast || options.rules.ast;

            if (options.project && options.languages) {
                this.runLint(
                    projectPath, languagePath, optionZombiesRule,
                    optionViewsRule, optionIgnore, optionMaxWarning, optionMisprint,
                    optionMisprintCoefficient, optionIgnoredKeys, optionIgnoredMisprintKeys, optionAstRules, tsConfigPath
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
        project: string,
        languages: string,
        zombies?: ErrorTypes,
        views?: ErrorTypes,
        ignore?: string,
        maxWarning: number = 1,
        misprint?: ErrorTypes,
        misprintCoefficient: number = 0.9,
        ignoredKeys: string[] = [],
        ignoredMisprintKeys: string[] = [],
        ast: IRulesAstConfig = {
            isNgxTranslateImported: ErrorTypes.error
        },
        tsConfigPath?: string,
    ): void {
            const errorConfig: IRulesConfig = {
                misprint: misprint || ErrorTypes.warning,
                zombieKeys: zombies || ErrorTypes.warning,
                keysOnViews: views || ErrorTypes.error,
                ast,
                maxWarning,
                ignoredKeys,
                ignoredMisprintKeys,
                misprintCoefficient,
            };
            const validationModel: NgxTranslateLint = new NgxTranslateLint(project, languages, ignore, errorConfig, tsConfigPath);
            const resultCliModel: ResultCliModel = validationModel.lint(maxWarning);
            const resultModel: ResultModel = resultCliModel.getResultModel();
            resultModel.printResult();

            process.exitCode = resultCliModel.exitCode();

            if (resultModel.hasError) {
                throw new FatalErrorModel(chalk.red(resultModel.message));
            }
    }
}

export { Cli };
