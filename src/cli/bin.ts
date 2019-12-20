#!/usr/bin/env node

import commander from 'commander';

import {runLint} from './runner';
import {ErrorTypes, StatusCodes} from "./../core";
import {OptionModel} from './models';
import {OptionsTypes} from './enums';

import {config} from './../core/config';

const name: string = 'ngx-translate-lint';

const options: OptionModel[] = [
    new OptionModel({
        short: 'p',
        name: 'project',
        required: true,
        type: OptionsTypes.glob,
        descriptionShort: `The path to project folder`,
        descriptionLong: ``,
        default: config.defaultValues.projectPath,
        possibleValues: [
            'relative path',
            'absolute path'
        ]
    }),
    new OptionModel({
        short: 'l',
        name: 'languages',
        required: true,
        type: OptionsTypes.glob,
        descriptionShort: `The path to languages folder`,
        descriptionLong: ``,
        default: config.defaultValues.languagesPath,
        possibleValues: [
            'relative path',
            'absolute path'
        ]
    }),
    new OptionModel({
        short: 'v',
        name: 'views',
        required: false,
        type: OptionsTypes.enum,
        descriptionShort: `Described how to handle the error of missing keys on view`,
        descriptionLong: ``,
        default: ErrorTypes.error,
        possibleValues: [
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
        descriptionShort: `Described how to handle the error of zombies keys`,
        descriptionLong: ``,
        default: ErrorTypes.warning,
        possibleValues: [
            ErrorTypes.disable,
            ErrorTypes.warning,
            ErrorTypes.error
        ]
    }),
    new OptionModel({
        short: 'i',
        name: 'ignore',
        required: false,
        type: OptionsTypes.glob,
        descriptionShort: `Ignore projects and languages files`,
        descriptionLong: ``,
        possibleValues: [
            'relative path',
            'absolute path'
        ]
    }),
    new OptionModel({
        name: 'maxWarning',
        required: false,
        type: OptionsTypes.glob,
        descriptionShort: `Max count of warnings in all files. If this value more that count of warnings, then an error is return`,
        descriptionLong: ``,
        default: '0',
        possibleValues: [
            'number'
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
    $ ${name} -p '${config.defaultValues.projectPath}' -i './src/assets/i18n/EN-us.json, ./stc/app/app.*.{html,ts}'

`);
    });

commander.parse(process.argv);

if (commander.project && commander.languages) {
    runLint(commander.project, commander.languages, commander.zombies, commander.views, commander.ignore, commander.maxWarning);
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
