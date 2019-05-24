import {
    ErrorTypes, ErrorFlow, ResultErrorModel
} from "../../../src/core";

import { getAbsolutePath, languagesFolder, projectFolder } from '../utils';

const assertFullModel: ResultErrorModel[]= [
    new ResultErrorModel(
        'OBJECT.KEY_FROM_LOCALE.ABSENT_IN_ALL_VIEWS',
        ErrorFlow.zombie, ErrorTypes.warning,
        getAbsolutePath(languagesFolder, 'EN-eu.json'),
    ),
    new ResultErrorModel(
        'STRING.KEY_FROM_DIRECTIVE_VIEW.EXIST_IN_ONE_LOCALE',
        ErrorFlow.views, ErrorTypes.error,
        getAbsolutePath(projectFolder, 'directive.keys.html'),
        [
            'EN-us.json'
        ]
    ),
    new ResultErrorModel(
        'STRING.KEY_FROM_DIRECTIVE_VIEW.ABSENT_IN_ALL_LOCALES',
        ErrorFlow.views, ErrorTypes.error,
        getAbsolutePath(projectFolder, 'directive.keys.html'),
        [
            'EN-eu.json',
            'EN-us.json'
        ]
    ),
    new ResultErrorModel(
        'STRING.KEY_FROM_DIRECTIVE_INSIDE_TAG_VIEW.EXIST_IN_ONE_LOCALE',
        ErrorFlow.views, ErrorTypes.error,
        getAbsolutePath(projectFolder, 'directive.keys.html'),
        [
            'EN-us.json'
        ]
    ),
    new ResultErrorModel(
        'OBJECT.KEY_FROM_DIRECTIVE_INSIDE_TAG_VIEW.ABSENT_IN_ALL_LOCALES',
        ErrorFlow.views, ErrorTypes.error,
        getAbsolutePath(projectFolder, 'directive.keys.html'),
        [
            'EN-eu.json',
            'EN-us.json'
        ]
    ),
    new ResultErrorModel(
        'STRING.KEY_FROM_ENUM.EXIST_IN_ONE_LOCALE',
        ErrorFlow.views, ErrorTypes.error,
        getAbsolutePath(projectFolder, 'enum.keys.ts'),
        [
           'EN-us.json'
        ]
    ),
    new ResultErrorModel(
        'STRING.KEY_FROM_PIPE_VIEW.EXIST_IN_ONE_LOCALE',
        ErrorFlow.views, ErrorTypes.error,
        getAbsolutePath(projectFolder, 'pipe.keys.html'),
        [
            'EN-us.json'
        ]
    ),
    new ResultErrorModel(
        'STRING.KEY_FROM_PIPE_VIEW.ABSENT_IN_ALL_LOCALES',
        ErrorFlow.views, ErrorTypes.error,
        getAbsolutePath(projectFolder, 'pipe.keys.html'),
        [
            'EN-eu.json',
            'EN-us.json'
        ]
    ),
];

export { assertFullModel };
