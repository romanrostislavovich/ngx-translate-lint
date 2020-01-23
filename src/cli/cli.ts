#!/usr/bin/env node
import commander from 'commander';

import { OptionModel } from './models';
import {
    ErrorTypes,
    FatalErrorModel,
    IRulesConfig, MisprintModel,
    NgxTranslateLint,
    ResultCliModel,
    ResultModel,
    StatusCodes
} from "./../core";

import { config } from './../core/config';
import { OptionsLongNames } from './enums';
import chalk from 'chalk';
import * as fs from 'fs';
import { DirectiveSymbol, ProjectSymbols, ResourceResolver } from 'ngast';
import { CompileNgModuleMetadata, CompileTemplateMetadata, ElementAst, TextAst, ASTWithSource } from '@angular/compiler';
import { readFileSync } from 'fs';

const name: string = 'ngx-translate-lint';
// tslint:disable-next-line:no-any
const docs: any = {
    name,
    usage: '[options]',
    description: 'Simple CLI tools for check `ngx-translate` keys in app',
    examples: `

Examples:

    $ ${name} -p '${config.defaultValues.projectPath}' -l '${config.defaultValues.languagesPath}'
    $ ${name} -p '${config.defaultValues.projectPath}' -z '${ErrorTypes.disable}' -v '${ErrorTypes.error}'
    $ ${name} -p '${config.defaultValues.projectPath}' -i './src/assets/i18n/EN-us.json, ./stc/app/app.*.{html,ts}'

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
            const options: any = this.cliClient.config ? this.parseConfig(this.cliClient.config) : this.cliClient;
            if (options.project && options.languages) {
                this.runLint(
                    options.project, options.languages, options.zombies,
                    options.views, options.ignore, options.maxWarning, options.misprint,
                    options.misprintCoefficient
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
            process.exitCode =  StatusCodes.crash;
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

    // tslint:disable-next-line:no-any
    private parseConfig(configPath: string): any {
        if (!fs.existsSync(configPath)) {
            throw new FatalErrorModel(chalk.red(`Config file doesn't exists by path ${configPath}`));
        }
        const configFile: Buffer = fs.readFileSync(configPath);
        // tslint:disable-next-line:no-any
        const result: any = JSON.parse(configFile.toString());
        return result;
    }

    private runLint(
        project: string,
        languages: string,
        views?: ErrorTypes,
        ignore?: string,
        zombies?: ErrorTypes,
        maxWarning?: number,
        misprint?: ErrorTypes,
        misprintCoefficient?: number,
    ): void {
            const misprintModel: MisprintModel = new MisprintModel(misprint, misprintCoefficient);
            const errorConfig: IRulesConfig = {
                keysOnViews: views || ErrorTypes.error,
                zombieKeys: zombies || ErrorTypes.warning,
                misprint: misprintModel,
            };
            const validationModel: NgxTranslateLint = new NgxTranslateLint(project, languages, ignore, errorConfig);
            const resultCliModel: ResultCliModel = validationModel.lint(maxWarning);
            const resultModel: ResultModel = resultCliModel.getResultModel();
            resultModel.printResult();

            this.runAst(project);
            process.exitCode = resultCliModel.exitCode;
            if (resultModel.hasError) {
                throw new FatalErrorModel(chalk.red(resultModel.message));
            }
    }

    public runAst(project: string): void {
        // tslint:disable-next-line:no-any
        debugger;
        let parseError: any = null;
        const projectSymbols: ProjectSymbols = new ProjectSymbols(
            project,
            resourceResolver,
            (e: any) => (parseError = e)
        );
        let allDirectives: DirectiveSymbol[] = projectSymbols.getDirectives();
        if (!parseError) {
            allDirectives = allDirectives.filter(
                el => el.symbol.filePath.indexOf("node_modules") === -1
            );

            ngxReplacer(allDirectives);

                // switch (config.format) {
                // case 'i18n':
                //     i18nTranslate.replacer(allDirectives, config);
                //     break;
                // default:
                //     error('format "' + config.format + '" unsoported, Only: ngx-translate, i18n.');
                //     process.exit(1);
                //     break;
           // }
        } else {
            error(parseError);
        }
    }
}

const error: (arg: string) => void = (message: string) => {
    // tslint:disable-next-line:no-console
    console.error(chalk.bgRed.white(message));
};

export function ngxReplacer(allDirectives: DirectiveSymbol[]): void {
    const jsonResult: any = {};
    allDirectives.forEach(el => {
        try {
            if (el.isComponent()) {
                // Component
                const moduleNew: CompileNgModuleMetadata | undefined = el.getModule();
                const moduleName: string = moduleNew ? moduleNew.toSummary().type.reference.name : undefined;
                const componentName: string = el.symbol.name;
                const name: string = moduleName + '.' + componentName;
                if (!jsonResult[moduleName]) {
                    jsonResult[moduleName] = {};
                }
                jsonResult[moduleName][componentName] = {};
                const texts: string[] = [];
                (el.getTemplateAst().templateAst || []).forEach(element => {
                    texts.push(...getTextAst(element as ElementAst));
                });
                const resolverDate: CompileTemplateMetadata | null =  el.getResolvedMetadata();
                const url: string = (!!resolverDate ? resolverDate.templateUrl : '') || el.symbol.filePath;
                texts.forEach((text, i) => {
                    jsonResult[moduleName][componentName][i] = text;
                    console.log(url);
                    console.log(text);
                    // replace({
                    //     regex: text,
                    //     replacement: `{{ '${name}.${i}' | translate }}`,
                    //     paths: [url]
                    // });
                });
            } else {
                // Directive
            }
        } catch (e) {
            // Component
            // tslint:disable-next-line:no-console
            console.error(e);
            // exception only component
        }
    });
    // saving data
    // if (!fs.existsSync(config.outPath)) {
    //     fs.mkdirSync(config.outPath, { recursive: true });
    // }
    // const locales: string[] = [config.inLocacte, ...config.outLocacte];
    // locales.forEach(locale => {
    //     const outFile: string = path.join(config.outPath, `${locale}.json`);
    //     fs.writeFile(outFile, JSON.stringify(jsonResult), 'utf8', () => {});
    // });
}

export function getTextAst(element: ElementAst): string[] {
    const texts: string[] = [];
    if (element && element.children && element.children.length) {
        element.children.forEach((child: any) => {
            const name: string = child.constructor.name;
            const value: TextAst | ASTWithSource | string | any = (child as TextAst).value;
            if (value) {
                console.log(name);
                if (name === 'TextAst' && value.trim() !== '') {
                    texts.push(child.value);
                } else {
                    const source: string | null = (value as ASTWithSource).source;
                    // if (typeof value === 'object' && source && source.trim() !== '') {
                    //   texts.push(source);
                    // }
                    if(value.constructor.name === 'ASTWithSource'){
                        texts.push(source || '');
                    }
                }
            } else {
                const childTexts: string[] = getTextAst(child as ElementAst);
                childTexts.forEach((el: any) => {
                    texts.push(el);
                });
            }
        });
    }
    return texts;
}

export const resourceResolver: ResourceResolver = {
    get(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(url, 'utf-8', (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });
    },
    getSync(url: string): string {
        return readFileSync(url).toString();
    }
};

export { Cli };
