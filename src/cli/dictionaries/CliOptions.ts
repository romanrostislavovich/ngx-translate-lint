import { OptionModel } from './../models';
import { config, ErrorTypes } from './../../core';
import { OptionsPath, OptionsLongNames, OptionsShortNames } from './../enums';
import { ArgumentTypes } from 'conventional-cli';

const cliOptions: OptionModel[] = [
    new OptionModel({
        shortName: OptionsShortNames.project,
        longName: OptionsLongNames.project,
        required: true,
        type: ArgumentTypes.glob,
        description: `The path to project folder`,
        additionalDescription: ``,
        default: config.defaultValues.projectPath,
        values: [
            OptionsPath.relative,
            OptionsPath.absolute
        ]
    }),
    new OptionModel({
        shortName: OptionsShortNames.languages,
        longName: OptionsLongNames.languages,
        required: true,
        type: ArgumentTypes.glob,
        description: `The path to languages folder`,
        additionalDescription: ``,
        default: config.defaultValues.languagesPath,
        values: [
            OptionsPath.relative,
            OptionsPath.absolute
        ]
    }),
    new OptionModel({
        shortName: OptionsShortNames.views,
        longName: OptionsLongNames.views,
        required: false,
        type: ArgumentTypes.enum,
        description: `Described how to handle the error of missing keys on view`,
        additionalDescription: ``,
        default: ErrorTypes.error,
        values: [
            ErrorTypes.disable,
            ErrorTypes.warning,
            ErrorTypes.error
        ]
    }),
    new OptionModel({
        shortName: OptionsShortNames.zombies,
        longName: OptionsLongNames.zombies,
        required: false,
        type: ArgumentTypes.enum,
        description: `Described how to handle the error of zombies keys`,
        additionalDescription: ``,
        default: ErrorTypes.warning,
        values: [
            ErrorTypes.disable,
            ErrorTypes.warning,
            ErrorTypes.error
        ]
    }),
    new OptionModel({
        shortName: OptionsShortNames.ignore,
        longName: OptionsLongNames.ignore,
        required: false,
        type: ArgumentTypes.glob,
        description: `Ignore projects and languages files`,
        additionalDescription: ``,
        values: [
            OptionsPath.relative,
            OptionsPath.absolute
        ]
    }),
    new OptionModel({
        longName: OptionsLongNames.maxWarning,
        required: false,
        type: ArgumentTypes.glob,
        description: `Max count of warnings in all files. If this value more that count of warnings, then an error is return`,
        additionalDescription: ``,
        default: '0',
        values: [
            ArgumentTypes.number,
        ]
    }),
    new OptionModel({
        shortName: OptionsShortNames.misprint,
        longName: OptionsLongNames.misprint,
        required: false,
        type: ArgumentTypes.enum,
        description: `Try to find matches with misprint keys on views and languages keys. Coefficient: 0.9`,
        additionalDescription: ``,
        default: ErrorTypes.warning,
        values: [
            ErrorTypes.disable,
            ErrorTypes.warning,
            ErrorTypes.error
        ]
    }),
    new OptionModel({
        longName: OptionsLongNames.misprintCoefficient,
        shortName: OptionsShortNames.misprintCoefficient,
        required: false,
        type: ArgumentTypes.number,
        description: `Coefficient for misprint option can be from 0 to 1.0.`,
        additionalDescription: ``,
        default: '0.9',
    }),
    new OptionModel({
        longName: OptionsLongNames.config,
        shortName: OptionsShortNames.config,
        required: false,
        type: ArgumentTypes.number,
        description: `Path to config`,
        additionalDescription: ``,
    }),
];

export  { cliOptions };
