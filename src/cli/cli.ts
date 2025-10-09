#!/usr/bin/env node
import commander, { Option } from 'commander';

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

const name: string = 'ngx-translate-lint';

// tslint:disable-next-line:no-any
const docs: any = {
    name,
    usage: '[options]',
    description: 'Simple CLI tools for check `ngx-translate` keys in app',
    examples: `

Examples:

    $ ${name} -p ${config.defaultValues.project} -l ${config.defaultValues.languages}
    $ ${name} -p ${config.defaultValues.project} -z ${ErrorTypes.disable} -v ${ErrorTypes.error}
    $ ${name} -p ${config.defaultValues.project} -i ./src/assets/i18n/EN-us.json, ./src/app/app.*.{json}
    $ ${name} -p ${config.defaultValues.project} -l https://8.8.8.8/locales/EN-eu.json

`
};

class Cli {
    // tslint:disable-next-line:no-any
    private cliClient: any = commander.program;
    private cliOptions: OptionModel[] = [];

    constructor(options: OptionModel[]) {
        this.cliOptions = options;
    }

    public static async run(options: OptionModel[]): Promise<void> {
        const cli: Cli = new Cli(options);
        cli.init();
        cli.parse();
        await cli.runCli();
    }

    public init(options: OptionModel[] = this.cliOptions): void {
        options.forEach((option: OptionModel) => {
            const optionFlag: string = option.getFlag();
            const optionDescription: string = option.getDescription();
            const optionDefaultValue: string | ErrorTypes | undefined = option.default;
            this.cliClient.addOption(new Option(optionFlag, optionDescription).default(optionDefaultValue));
        });

        // tslint:disable-next-line:no-any
        const packageJson: any = parseJsonFile(getPackageJsonPath());
        this.cliClient.version(packageJson.version, '-v, --version', `Print current version of ${name}`);

        this.cliClient
            .name(docs.name)
            .usage(docs.usage)
            .description(docs.description)
            .on(`--${OptionsLongNames.help}`, () => {
                // tslint:disable-next-line:no-console
                console.log(docs.examples);
            });
    }

    public async runCli(): Promise<void> {
        try {
            // Options
            const fileOptions: any = this.cliClient.opts().config ? parseJsonFile(this.cliClient.opts().config) : {};
            const commandOptions: any = this.cliClient.opts();
            const defaultOptions: any = config.defaultValues;

            const resultOptions: any = {
              ...defaultOptions,
              ...defaultOptions.rules,

              ...fileOptions,
              ...fileOptions.rules,

              ...commandOptions
            };

            const projectPath: string = resultOptions.project;
            const languagePath: string = resultOptions.languages;
            const fixZombiesKeys: boolean = resultOptions.fixZombiesKeys;
            const deepSearch: ToggleRule = resultOptions.deepSearch;
            const optionIgnore: string = resultOptions.ingore;
            const optionMisprint: ErrorTypes = resultOptions.misprintKeys;
            const optionEmptyKey: ErrorTypes = resultOptions.emptyKeys;
            const optionViewsRule: ErrorTypes = resultOptions.keysOnViews;
            const optionMaxWarning: number = resultOptions.maxWarning;
            const optionZombiesRule: ErrorTypes = resultOptions.zombiesKeys;
            const optionIgnoredKeys: string[] = resultOptions.ignoreKeys;
            const optionMisprintCoefficient: number = resultOptions.misprintCoefficient;
            const optionIgnoredMisprintKeys: string[] = resultOptions.ignoredMisprintKeys;
            const optionCustomRegExpToFindKeys: string[] | RegExp[] = resultOptions.customRegExpToFindKeys;

            if (projectPath && languagePath) {
                await this.runLint(
                    projectPath, languagePath, optionZombiesRule,
                    optionViewsRule, optionIgnore, optionMaxWarning, optionMisprint, optionEmptyKey, deepSearch,
                    optionMisprintCoefficient, optionIgnoredKeys, optionIgnoredMisprintKeys, optionCustomRegExpToFindKeys
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
            if (!this.cliClient.opts()[String(option.longName)]) {
                accum = false;
                // tslint:disable-next-line: no-console
                console.error(`Missing required argument: ${option.getFlag()}`);
            }
            return accum;
        }, false);

        return missingRequiredOption;
    }

    public  async runLint(
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
        fixZombiesKeys?: boolean,
    ): Promise<void> {
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
            const validationModel: NgxTranslateLint = new NgxTranslateLint(project, languages, ignore, errorConfig);
            const resultCliModel: ResultCliModel = await validationModel.lint(maxWarning);
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
