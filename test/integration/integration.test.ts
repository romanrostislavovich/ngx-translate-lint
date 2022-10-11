import 'mocha';

import path from 'path';
import { assert, expect } from 'chai';

import {
    ErrorFlow,
    ErrorTypes,
    IRulesConfig,
    KeyModelWithLanguages,
    LanguagesModel,
    NgxTranslateLint,
    ResultCliModel,
    ResultErrorModel,
} from './../../src/core';

import { assertFullModel } from './results/arguments.full';
import { assertDefaultModel } from './results/default.full';
import { assertCustomConfig } from './results/custom.config';
import { configValues } from './results/config.values';
import { getAbsolutePath, projectFolder } from './utils';

describe('Core Integration', () => {
    const ignorePath: string = '';

    const projectIgnorePath: string = './test/integration/inputs/views/pipe.keys.html';
    const projectWithMaskPath: string = './test/integration/inputs/views/*.{html,ts}';
    const projectAbsentMaskPath: string = './test/integration/inputs/views/';

    const languagesIgnorePath: string = './test/integration/inputs/locales/EN-eu.json';
    const languagesWithMaskPath: string = './test/integration/inputs/locales/EN-*.json';
    const languagesIncorrectFile: string = './test/integration/inputs/locales/incorrect.json';
    const languagesAbsentMaskPath: string = './test/integration/inputs/locales';

    describe('Misprint', () => {
        it('should be warning by default', () => {
            // Arrange
            const hasMisprint: boolean = true;
            const countMisprint: number = 1;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(hasMisprint, result.hasMisprint());
            assert.deepEqual(countMisprint, result.countMisprint());
        });
        it('should be error', () => {
            // Arrange
            const errorConfig: IRulesConfig = {
                ast: {
                    isNgxTranslateImported: ErrorTypes.disable,
                },
                keysOnViews: ErrorTypes.error,
                zombieKeys: ErrorTypes.warning,
                misprint:  ErrorTypes.error,
                maxWarning: 1,
                misprintCoefficient: 0.9,
                ignoredKeys: ["IGNORED.KEY.FLAG"],
                ignoredMisprintKeys: []
            };
            const hasMisprint: boolean = true;
            const countMisprint: number = 1;
            const correctError: ResultErrorModel = new ResultErrorModel(
                'STRING.KEY_FROM_PIPE_VIEW.MISPRINT_IN_ONE_LOCALES',
                    ErrorFlow.misprint, ErrorTypes.error,
                    getAbsolutePath(projectFolder, 'pipe.keys.html'),
                    [
                        'EN-eu.json',
                        'EN-us.json'
                    ],
                    [
                        "STRING.KEY_FROM_PIPE_VIEW.MISPRINT_IN_IN_LOCALES"
                    ]
            );

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath,  '', errorConfig);
            const result: ResultCliModel = model.lint();
            const clearErrors: ResultErrorModel[] = result.errors.filter((error: ResultErrorModel) => error.errorFlow === ErrorFlow.misprint);

            // Assert
            assert.deepEqual(hasMisprint, result.hasMisprint());
            assert.deepEqual(countMisprint, result.countMisprint());
            assert.deepEqual(correctError, clearErrors.pop());
        });
        it('should be have 2 or more suggestions for one key', () => {
            // Arrange
            const hasMisprint: boolean = true;
            const countMisprint: number = 2;
            const ignorePath: string = `${languagesIgnorePath}, ${projectIgnorePath}`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(hasMisprint, result.hasMisprint());
            assert.deepEqual(countMisprint, result.countMisprint());
        });
    });
    describe('Warnings', () => {
        it('should be 0 by default', () => {
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
            const result:  ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(0, result.maxCountWarning);
        });
        it('should be error if warnings more thant 2', () => {
            // Arrange
            const ignorePath: string = '';
            const maxWarnings: number = 5;
            const ifFullOfWarning: boolean = true;
            const errorConfig: IRulesConfig = {
                ast: {
                    isNgxTranslateImported: ErrorTypes.disable,
                },
                keysOnViews: ErrorTypes.warning,
                zombieKeys: ErrorTypes.warning,
                maxWarning: 1,
                misprintCoefficient: 0.9,
                misprint: ErrorTypes.disable,
                ignoredKeys: ["IGNORED.KEY.FLAG"],
                ignoredMisprintKeys: []
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result:  ResultCliModel = model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning());
            assert.deepEqual(maxWarnings, result.maxCountWarning);
        });
        it('should be warning if warnings less thant 10', () => {
            // Arrange
            const maxWarnings: number = 20;
            const ifFullOfWarning: boolean = false;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
            const result: ResultCliModel = model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning());
            assert.deepEqual(maxWarnings, result.maxCountWarning);
        });
    });
    describe('Ignore', () => {
        it('should be relative and absolute and have projects and languages files', () => {
            // Arrange
            const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
            const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result.errors);
        });

        it('should be empty or incorrect', () => {
            // Arrange
            const ignorePath: string = `null, 0, undefined, '',`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result.errors);
        });
    });
    describe('Path', () => {
        it('should be relative and absolute', () => {
            // Arrange
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesWithMaskPath);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result.errors);
        });

        it('should be absent mask', () => {
            // Arrange
            const ignorePath: string = `${languagesIgnorePath}, ${projectIgnorePath}, ${languagesIncorrectFile}`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectAbsentMaskPath, languagesAbsentMaskPath, ignorePath);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result.errors);
        });
        it('should be empty and incorrect', () => {
            // Arrange
            const emptyFolder: string = '';
            const incorrectFolder: string = '../files';

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(emptyFolder, incorrectFolder);

            // Assert
            expect(() => { model.lint(); }).to.throw();
        });

        it('should with parse error', () => {
            // Arrange
            const absoluteIncorrectLanguagesPath: string = path.resolve(__dirname, process.cwd(), languagesIncorrectFile);
            const errorMessage: string = `Can't parse JSON file: ${absoluteIncorrectLanguagesPath}`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesIncorrectFile);

            // Assert
            // model.lint();
            assert.throws(() => { model.lint(); }, errorMessage);
        });
    });

    describe('Config', () => {
        it('should be default', () => {
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
            const result:  ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result.errors);
        });
        it('should be incorrect', () => {
            // Arrange
            const errorConfig: object = {
                keysOnViews: 'incorrect',
                anotherIncorrectKey: ErrorTypes.disable
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig as IRulesConfig);

            // Assert
            expect(() => { model.lint(); }).to.throw();
        });
        it('should be custom', () => {
            // Arrange
            const errorConfig: IRulesConfig = {
                ast: {
                    isNgxTranslateImported: ErrorTypes.disable,
                },
                keysOnViews: ErrorTypes.warning,
                zombieKeys: ErrorTypes.disable,
                maxWarning: 1,
                misprintCoefficient: 0.9,
                misprint: ErrorTypes.disable,
                ignoredKeys: ["IGNORED.KEY.FLAG"],
                ignoredMisprintKeys: []
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertCustomConfig, result.errors);
        });
    });
    describe('API', () => {
        describe('getLanguages', () => {
           it('should be correct', () => {
               // Arrange
               const countOfLanguage: number = 2;
               // Act
               const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
               const result: LanguagesModel[] = model.getLanguages();

               // Assert
               assert.equal(result.length, countOfLanguage);
           });
        });
        describe('getKeys', () => {
            it('should be correct', () => {
                // Arrange
                 const countOfKeys: number = configValues.totalKeys;
                // Act
                const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
                const result: KeyModelWithLanguages[] = model.getKeys();

                // Assert
                assert.equal(result.length, countOfKeys);
            });
        });
    });
    it('with full arguments', () => {
        // Arrange
        const errorConfig: IRulesConfig = {
            ast: {
                isNgxTranslateImported: ErrorTypes.disable,
            },
            keysOnViews: ErrorTypes.error,
            zombieKeys: ErrorTypes.warning,
            maxWarning: 1,
            misprintCoefficient: 0.9,
            misprint: ErrorTypes.warning,
            ignoredKeys: ["IGNORED.KEY.FLAG"],
            ignoredMisprintKeys: []
        };
        const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);
        const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
        const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}`;

        // Act
        const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesWithMaskPath, ignorePath, errorConfig);
        const result: ResultCliModel = model.lint();

        // Assert
        assert.deepEqual(assertFullModel, result.errors);
    });
});
