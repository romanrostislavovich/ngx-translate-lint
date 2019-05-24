#!/usr/bin/env node

import commander from 'commander';

import { runLint } from './runner';
import { ErrorTypes } from "./../core";
import { OptionModel } from './models';
import { StatusCodes, OptionsTypes } from './enums';

import { config } from './../core/config';

const name: string = 'ngx-translate-lint';

const options: OptionModel[] = [
    new OptionModel({
        short: 'p',
        name: 'project',
        required: true,
        type: OptionsTypes.glob,
        describe: `The path to project folder`,
        description: ``,
        default: config.defaultValues.projectPath,
        possibaleValues: [
            'relative path',
            'absolute path'
        ]
    }),
    new OptionModel({
        short: 'l',
        name: 'languages',
        required: true,
        type: OptionsTypes.glob,
        describe: `The path to languages folder`,
        description: ``,
        default: config.defaultValues.languagesPath,
        possibaleValues: [
            'relative path',
            'absolute path'
        ]
    }),
    new OptionModel({
        short: 'v',
        name: 'views',
        required: false,
        type: OptionsTypes.enum,
        describe: `Described how to handle the error of missing keys on view`,
        description: ``,
        default: ErrorTypes.error,
        possibaleValues: [
            ErrorTypes.disable,
            ErrorTypes.warning,
            ErrorTypes.error
        ]
    }),
    new OptionModel({
        short: 'z',
        name: 'zombies',
        required: false,
        type: OptionsTypes.enum,
        describe: `Described how to handle the error of zombies keys`,
        description: ``,
        default: ErrorTypes.warning,
        possibaleValues: [
            ErrorTypes.disable,
            ErrorTypes.warning,
            ErrorTypes.error
        ]
    })
];

options.forEach((option: OptionModel) => {
    const commanderFlag: string = option.getFlag();
    const commanderDescription: string = option.getDescription();
    commander.option(commanderFlag, commanderDescription, option.default);
});

commander
    .name(name)
    .usage('[options]')
    .description('Simple CLI tools for check `ngx-translate` keys in app')
    .on('--help', () => {
        // tslint:disable-next-line: no-console
        console.log(`

Examples:

    $ ${name} -p '${config.defaultValues.projectPath}' -l '${config.defaultValues.languagesPath}'
    $ ${name} -p '${config.defaultValues.projectPath}' -z '${ErrorTypes.disable}' -v '${ErrorTypes.error}'

`);
    });

commander.parse(process.argv);

if (commander.project && commander.languages) {
    runLint(commander.project, commander.languages, commander.zombies, commander.views);
} else {
    const requiredOptions: OptionModel[] = options.filter((option: OptionModel) => option.required);
    const missingRequiredOption: boolean = requiredOptions.reduce((acum: boolean, option: OptionModel) => {
        if (!commander[option.name]) {
            acum = false;
            // tslint:disable-next-line: no-console
            console.error(`Missing required argument: ${option.getFlag()}`);
        }
        return acum;
    }, false);

    if (missingRequiredOption) {
        process.exit(StatusCodes.crash);
    } else {
        commander.help();
    }
}
