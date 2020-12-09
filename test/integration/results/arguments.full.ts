import {
    ErrorTypes, ErrorFlow, ResultErrorModel
} from "../../../src/core";

import { getAbsolutePath, languagesFolder, projectFolder } from '../utils';

const assertFullModel: ResultErrorModel[]= [
    new ResultErrorModel(
        'STRING.KEY_FROM_PIPE_VIEW.EXIST_IN_ALL_LOCALES',
        ErrorFlow.zombie, ErrorTypes.warning,
        getAbsolutePath(languagesFolder, 'EN-us.json'),
    ),
    new ResultErrorModel(
        'OBJECT.KEY_FROM_PIPE_VIEW.EXIST_IN_ALL_LOCALES',
        ErrorFlow.zombie, ErrorTypes.warning,
        getAbsolutePath(languagesFolder, 'EN-us.json'),
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
        'STRING.KEY_FROM_DIRECTIVE_INSIDE_TAG_VIEW.EXIST_IN_ONE_LOCALE_BUG_86',
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
            'EN-us.json'
        ]
    ),
    new ResultErrorModel(
        'STRING.KEY_FROM_DIRECTIVE_VIEW.EXIST_IN_ONE_LOCALE',
        ErrorFlow.misprint, ErrorTypes.warning,
        getAbsolutePath(projectFolder, 'directive.keys.html'),
        [
            'EN-us.json'
        ],
        [
            "STRING.KEY_FROM_DIRECTIVE_VIEW.EXIST_IN_ALL_LOCALES"
        ]
    ),
    new ResultErrorModel(
        'STRING.KEY_FROM_DIRECTIVE_INSIDE_TAG_VIEW.EXIST_IN_ONE_LOCALE',
        ErrorFlow.misprint, ErrorTypes.warning,
        getAbsolutePath(projectFolder, 'directive.keys.html'),
        [
            'EN-us.json'
        ],
        [
            "STRING.KEY_FROM_DIRECTIVE_INSIDE_TAG_VIEW.EXIST_IN_ALL_LOCALES"
        ]
    ),
];

export { assertFullModel };
