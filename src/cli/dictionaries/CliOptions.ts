import { OptionModel } from './../models';
import { config, ErrorTypes } from './../../core';
import { OptionsTypes, OptionsPath, OptionsLongNames, OptionsShortNames } from './../enums';

const cliOptions: OptionModel[] = [
    new OptionModel({
        short: OptionsShortNames.project,
        name: OptionsLongNames.project,
        required: true,
        type: OptionsTypes.glob,
        descriptionShort: `The path to project folder`,
        descriptionLong: ``,
        default: config.defaultValues.projectPath,
        possibleValues: [
            OptionsPath.relative,
            OptionsPath.absolute
        ]
    }),
    new OptionModel({
        short: OptionsShortNames.languages,
        name: OptionsLongNames.languages,
        required: true,
        type: OptionsTypes.glob,
        descriptionShort: `The path to languages folder`,
        descriptionLong: ``,
        default: config.defaultValues.languagesPath,
        possibleValues: [
            OptionsPath.relative,
            OptionsPath.absolute
        ]
    }),
    new OptionModel({
        short: OptionsShortNames.views,
        name: OptionsLongNames.views,
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
        short: OptionsShortNames.zombies,
        name: OptionsLongNames.zombies,
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
        short: OptionsShortNames.ignore,
        name: OptionsLongNames.ignore,
        required: false,
        type: OptionsTypes.glob,
        descriptionShort: `Ignore projects and languages files`,
        descriptionLong: ``,
        possibleValues: [
            OptionsPath.relative,
            OptionsPath.absolute
        ]
    }),
    new OptionModel({
        name: OptionsLongNames.maxWarning,
        required: false,
        type: OptionsTypes.glob,
        descriptionShort: `Max count of warnings in all files. If this value more that count of warnings, then an error is return`,
        descriptionLong: ``,
        default: '0',
        possibleValues: [
            OptionsTypes.number,
        ]
    }),
    new OptionModel({
        name: OptionsLongNames.misprint,
        short: OptionsShortNames.misprint,
        required: false,
        type: OptionsTypes.enum,
        descriptionShort: `Try to find matches with misprint keys on views and languages keys. Coefficient: 0.9`,
        descriptionLong: ``,
        default: ErrorTypes.warning,
        possibleValues: [
            ErrorTypes.disable,
            ErrorTypes.warning,
            ErrorTypes.error
        ]
    }),
];

export  { cliOptions };
