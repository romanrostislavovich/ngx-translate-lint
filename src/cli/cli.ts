#!/usr/bin/env node
import commander from 'commander';

import { OptionModel } from './models';
import {
    ErrorTypes,
    FatalErrorModel,
    IRulesConfig,
    NgxTranslateLint,
    ResultCliModel,
    ResultModel,
    StatusCodes,
    ToggleRule,
    parseJsonFile,
    getPackageJsonPath,
} from "./../core";

import { config } from './../core/config';
import { OptionsLongNames, OptionsShortNames } from './enums';
import chalk from 'chalk';
import { defaultConfig } from 'sinon';

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

        // tslint:disable-next-line:no-any
        const packageJson: any = parseJsonFile(getPackageJsonPath());
        this.cliClient.version(packageJson.version);

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

            const projectPath: string = this.cliClient.project  !== config.defaultValues.projectPath ? this.cliClient.project : options.project;
            const languagePath: string = this.cliClient.languages !== config.defaultValues.languagesPath? this.cliClient.languages : options.languages;
            const fixZombiesKeys: boolean = this.cliClient.fixZombiesKeys !== config.defaultValues.fixZombiesKeys ? this.cliClient.fixZombiesKeys : options.fixZombiesKeys;

            const tsConfigPath: string = options.tsConfigPath;

            let deepSearch: ToggleRule;
            let optionIgnore: string;
            let optionMisprint: ErrorTypes;
            let optionEmptyKey: ErrorTypes;
            let optionViewsRule: ErrorTypes;
            let optionMaxWarning: number ;
            let optionZombiesRule: ErrorTypes;
            let optionIgnoredKeys: string[];
            let optionMisprintCoefficient: number ;
            let optionIgnoredMisprintKeys: string[];
            let optionCustomRegExpToFindKeys: string[] | RegExp[];

            if (!!options.rules) {
                 deepSearch = options.rules.deepSearch;
                 optionIgnore = options.rules.ignore;
                 optionMisprint = options.rules.misprintKeys;
                 optionEmptyKey = options.rules.emptyKeys;
                 optionViewsRule =  options.rules.keysOnViews;
                 optionMaxWarning =  options.rules.maxWarning;
                 optionZombiesRule = options.rules.zombieKeys;
                 optionIgnoredKeys =  options.rules.ignoredKeys;
                 optionMisprintCoefficient = options.rules.misprintCoefficient;
                 optionIgnoredMisprintKeys =  options.rules.ignoredMisprintKeys;
                 optionCustomRegExpToFindKeys = options.rules.customRegExpToFindKeys;
            } else {
                 deepSearch = options.deepSearch;
                 optionIgnore = options.ignore;
                 optionMisprint = options.misprintKeys;
                 optionEmptyKey = options.emptyKeys;
                 optionViewsRule = options.keysOnViews;
                 optionMaxWarning =  options.maxWarning;
                 optionZombiesRule = options.zombieKeys;
                 optionIgnoredKeys = options.ignoredKeys;
                 optionMisprintCoefficient = options.misprintCoefficient;
                 optionIgnoredMisprintKeys = options.ignoredMisprintKeys;
                 optionCustomRegExpToFindKeys = options.customRegExpToFindKeys;
            }

            if (options.project && options.languages) {
                this.runLint(
                    projectPath, languagePath, optionZombiesRule,
                    optionViewsRule, optionIgnore, optionMaxWarning, optionMisprint, optionEmptyKey, deepSearch,
                    optionMisprintCoefficient, optionIgnoredKeys, optionIgnoredMisprintKeys, optionCustomRegExpToFindKeys, tsConfigPath
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
        this.printCurrentVersion();

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
        emptyKeys?: ErrorTypes,
        deepSearch?: ToggleRule,
        misprintCoefficient: number = 0.9,
        ignoredKeys: string[] = [],
        ignoredMisprintKeys: string[] = [],
        customRegExpToFindKeys: string[] | RegExp[] = [],
        tsConfigPath?: string,
        fixZombiesKeys?: boolean,
    ): void {
            const errorConfig: IRulesConfig = {
                misprintKeys: misprint || ErrorTypes.disable,
                deepSearch: deepSearch || ToggleRule.disable,
                zombieKeys: zombies || ErrorTypes.warning,
                emptyKeys: emptyKeys || ErrorTypes.warning,
                keysOnViews: views || ErrorTypes.error,
                maxWarning,
                ignoredKeys,
                ignoredMisprintKeys,
                misprintCoefficient,
                customRegExpToFindKeys,
            };
            const validationModel: NgxTranslateLint = new NgxTranslateLint(project, languages, ignore, errorConfig, tsConfigPath);
            const resultCliModel: ResultCliModel = validationModel.lint(maxWarning);
            const resultModel: ResultModel = resultCliModel.getResultModel();
            resultModel.printResult();
            resultModel.printSummery();

            process.exitCode = resultCliModel.exitCode();

            if (resultModel.hasError) {
                throw new FatalErrorModel(chalk.red(resultModel.message));
            }
    }

    private printCurrentVersion(): void {
        // tslint:disable-next-line:no-any
        const packageJson: any = parseJsonFile(getPackageJsonPath());
        // tslint:disable-next-line:no-console
        console.log(`Current version: ${packageJson.version}`);
    }
}

export { Cli };
