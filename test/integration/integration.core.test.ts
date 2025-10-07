import 'mocha';

import path from 'path';
import { assert, expect } from 'chai';

import {
    config as defaultConfig,
    ErrorFlow,
    ErrorTypes,
    IRulesConfig,
    KeyModelWithLanguages,
    LanguagesModel,
    NgxTranslateLint,
    ResultCliModel,
    ResultErrorModel,
    ToggleRule,
} from './../../src/core';

import { assertFullModel } from './results/arguments.full';
import { assertAngular17Model } from './results/angular_17.full';
import { assertDefaultModel } from './results/default.full';
import { assertCustomConfig } from './results/custom.config';
import { configValues } from './results/config.values';
import { getAbsolutePath, projectFolder, sortResult } from './utils';

describe('Core Integration', () => {
    const projectIgnorePath: string = './test/integration/inputs/views/pipe.keys.html';
    const projectWithMaskPath: string = './test/integration/inputs/views/*.{html,ts}';
    const projectAngular17Path: string = './test/integration/inputs/views/angular_17.html';
    const projectAbsentMaskPath: string = './test/integration/inputs/views/';

    const languagesIgnorePath: string = './test/integration/inputs/locales/EN-eu.json';
    const languagesWithMaskPath: string = './test/integration/inputs/locales/EN-*.json';
    const languagesAngular17Path: string = './test/integration/inputs/locales/angular_17.json';
    const languagesIncorrectFile: string = './test/integration/inputs/locales/incorrect.json';
    const languagesAbsentMaskPath: string = './test/integration/inputs/locales';

    const ignorePath: string = '';
    const ignoreAngular17ViewPath: string = projectAngular17Path;
    const ignoreAngular17LanguagesPath: string = languagesAngular17Path;

    describe('Custom RegExp to find keys', () => {
       it('should be find keys',async () => {
           // Arrange
           const errorConfig: IRulesConfig = {
               ...defaultConfig.defaultValues.rules,
               customRegExpToFindKeys: [/marker\("(.*)"\)/gm]
           };

           // Act
           const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, errorConfig);
           const result: ResultCliModel = await model.lint();

           // Assert
           assert.deepEqual(result.errors.find(x => x.value === 'CUSTOM.REGEXP.ONE')?.errorType, ErrorTypes.warning);
       });
    });
    describe('Empty Keys', () => {
        it('should be warning by default', async () => {
            // Arrange
            const hasEmptyKeys: boolean = true;
            const countEmptyKeys: number = 1;
            const errorType: ErrorTypes = ErrorTypes.warning;
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(errorType, result.getEmptyKeys()[0].errorType);
            assert.deepEqual(hasEmptyKeys, result.hasEmptyKeys());
            assert.deepEqual(countEmptyKeys, result.countEmptyKeys());
        });
        it('should be error', async () => {
            // Arrange
            const hasEmptyKeys: boolean = true;
            const countEmptyKeys: number = 1;
            const errorType: ErrorTypes = ErrorTypes.error;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rules,
                emptyKeys: ErrorTypes.error,
            };
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, undefined, errorConfig);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(errorType, result.getEmptyKeys()[0].errorType);
            assert.deepEqual(hasEmptyKeys, result.hasEmptyKeys());
            assert.deepEqual(countEmptyKeys, result.countEmptyKeys());
        });
    });
    describe('Misprint', () => {
        it('should be disable by default', async () => {
            // Arrange
            const hasMisprint: boolean = false;
            const countMisprint: number = 0;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(hasMisprint, result.hasMisprint());
            assert.deepEqual(countMisprint, result.countMisprint());
        });
        it('should be error', async () => {
            // Arrange
            const errorConfig: IRulesConfig = {
                keysOnViews: ErrorTypes.error,
                zombieKeys: ErrorTypes.warning,
                misprintKeys:  ErrorTypes.error,
                deepSearch: ToggleRule.enable,
                emptyKeys: ErrorTypes.warning,
                maxWarning: 1,
                misprintCoefficient: 0.9,
                ignoredKeys: ["IGNORED.KEY.FLAG"],
                ignoredMisprintKeys: [],
                customRegExpToFindKeys: []
            };
            const hasMisprint: boolean = true;
            const countMisprint: number = 1;
            const correctError: ResultErrorModel = new ResultErrorModel(
                'STRING.KEY_FROM_PIPE_VIEW.MISPRINT_IN_ONE_LOCALES',
                    ErrorFlow.misprintKeys, ErrorTypes.error,
                    getAbsolutePath(projectFolder, 'pipe.keys.html'),
                    [
                        'EN-us.json',
                        'EN-eu.json',
                    ],
                    [
                        "STRING.KEY_FROM_PIPE_VIEW.MISPRINT_IN_IN_LOCALES"
                    ]
            );

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath,  '', errorConfig);
            const result: ResultCliModel = await model.lint();
            const clearErrors: ResultErrorModel[] = result.errors.filter((error: ResultErrorModel) => error.errorFlow === ErrorFlow.misprintKeys);

            // Assert
            assert.deepEqual(hasMisprint, result.hasMisprint());
            assert.deepEqual(countMisprint, result.countMisprint());
            assert.deepEqual(correctError, clearErrors.pop());
        });
        it('should be have 2 or more suggestions for one key', async () => {
            // Arrange
            const hasMisprint: boolean = true;
            const countMisprint: number = 2;
            const ignorePath: string = `${languagesIgnorePath}, ${projectIgnorePath}`;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rules,
                misprintKeys:  ErrorTypes.warning,
            };
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(hasMisprint, result.hasMisprint());
            assert.deepEqual(countMisprint, result.countMisprint());
        });
    });
    describe('Warnings', () => {
        it('should be 0 by default', async () => {
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
            const result:  ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(0, result.maxCountWarning);
        });
        it('should be error if warnings more thant 2', async () => {
            // Arrange
            const ignorePath: string = '';
            const maxWarnings: number = 5;
            const ifFullOfWarning: boolean = true;
            const errorConfig: IRulesConfig = {
                keysOnViews: ErrorTypes.warning,
                zombieKeys: ErrorTypes.warning,
                emptyKeys: ErrorTypes.warning,
                maxWarning: 1,
                misprintCoefficient: 0.9,
                misprintKeys: ErrorTypes.disable,
                deepSearch: ToggleRule.enable,
                ignoredKeys: ["IGNORED.KEY.FLAG"],
                ignoredMisprintKeys: [],
                customRegExpToFindKeys: []
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result:  ResultCliModel = await model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning());
            assert.deepEqual(maxWarnings, result.maxCountWarning);
        });
        it('should be warning if warnings less thant 10', async () => {
            // Arrange
            const maxWarnings: number = 20;
            const ifFullOfWarning: boolean = false;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
            const result: ResultCliModel =  await model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning());
            assert.deepEqual(maxWarnings, result.maxCountWarning);
        });
    });
    describe('Ignore', () => {
        it('should be relative and absolute and have projects and languages files', async () => {
            // Arrange
            const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
            const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}, ${ignoreAngular17LanguagesPath}, ${ignoreAngular17ViewPath}`;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rules,
                deepSearch: ToggleRule.enable,
                misprintKeys: ErrorTypes.warning
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result.errors);
        });

        it('should be empty or incorrect', async () => {
            // Arrange
            const ignorePath: string = `null, 0, undefined, '',`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(sortResult(assertDefaultModel), sortResult(result.errors));
        });
    });
    describe('Path', () => {
        it('should be relative and absolute', async () => {
            // Arrange
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesWithMaskPath);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(sortResult(assertDefaultModel), sortResult(result.errors));
        });

        it('should be absent mask', async () => {
            // Arrange
            const ignorePath: string = `${languagesIgnorePath}, ${projectIgnorePath}, ${languagesIncorrectFile}, ${ignoreAngular17LanguagesPath}, ${ignoreAngular17ViewPath}`;
            const errorConfig: IRulesConfig = {
                ...defaultConfig.defaultValues.rules,
                deepSearch: ToggleRule.enable,
                misprintKeys: ErrorTypes.warning
            };
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectAbsentMaskPath, languagesAbsentMaskPath, ignorePath, errorConfig);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result.errors);
        });
        it('should be empty and incorrect', async () => {
            // Arrange
            const emptyFolder: string = '';
            const incorrectFolder: string = '../files';

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(emptyFolder, incorrectFolder);

            // Assert
            let error: unknown;
            try {
                await model.lint();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('Error');
        });

        it('should with parse error', async () => {
            // Arrange
            const absoluteIncorrectLanguagesPath: string = path.resolve(__dirname, process.cwd(), languagesIncorrectFile);
            const errorMessage: string = `Can't parse JSON file: ${absoluteIncorrectLanguagesPath}`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesIncorrectFile);

            // Assert
            let error: unknown;
            try {
                await model.lint();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('Error');
        });
    });

    describe('Config', () => {
        it('should be default', async () => {
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath);
            const result:  ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(sortResult(assertDefaultModel), sortResult(result.errors));
        });
        it('should be incorrect', async () => {
            // Arrange
            const errorConfig: object = {
                keysOnViews: 'incorrect',
                anotherIncorrectKey: ErrorTypes.disable
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig as IRulesConfig);

            // Assert
            let error: unknown;
            try {
                await model.lint();
            } catch (e) {
                error = e;
            }
            expect(error).to.be.an('Error');
        });
        it('should be custom', async () => {
            // Arrange
            const errorConfig: IRulesConfig = {
                keysOnViews: ErrorTypes.warning,
                zombieKeys: ErrorTypes.disable,
                emptyKeys: ErrorTypes.warning,
                maxWarning: 1,
                misprintCoefficient: 0.9,
                misprintKeys: ErrorTypes.disable,
                deepSearch: ToggleRule.enable,
                ignoredKeys: ["IGNORED.KEY.FLAG", "STRING.KEY_FROM_ANGULAR_17.EXIST_IN_ALL_LOCALES"],
                ignoredMisprintKeys: [],
                customRegExpToFindKeys: []
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignoreAngular17ViewPath, errorConfig);
            const result: ResultCliModel = await model.lint();

            // Assert
            assert.deepEqual(sortResult(assertCustomConfig), sortResult(result.errors));
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
    it('Angular 17',  async () => {
        const errorConfig: IRulesConfig = {
            keysOnViews: ErrorTypes.error,
            zombieKeys: ErrorTypes.warning,
            emptyKeys: ErrorTypes.warning,
            maxWarning: 1,
            misprintCoefficient: 0.9,
            misprintKeys: ErrorTypes.warning,
            deepSearch: ToggleRule.enable,
            ignoredKeys: ["IGNORED.KEY.FLAG"],
            ignoredMisprintKeys: [],
            customRegExpToFindKeys: []
        };
        const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectAngular17Path);
        const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
        const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}`;

        // Act
        const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesAngular17Path, ignorePath, errorConfig);
        const result: ResultCliModel = await model.lint();

        // Assert
        assert.deepEqual(assertAngular17Model, result.errors);
    });
    it('with full arguments', async () => {
        // Arrange
        const errorConfig: IRulesConfig = {
            keysOnViews: ErrorTypes.error,
            zombieKeys: ErrorTypes.warning,
            emptyKeys: ErrorTypes.warning,
            maxWarning: 1,
            misprintCoefficient: 0.9,
            misprintKeys: ErrorTypes.warning,
            deepSearch: ToggleRule.enable,
            ignoredKeys: ["IGNORED.KEY.FLAG"],
            ignoredMisprintKeys: [],
            customRegExpToFindKeys: []
        };
        const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);
        const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
        const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsoluteProjectPath}, ${ignoreAngular17LanguagesPath}, ${ignoreAngular17ViewPath}`;

        // Act
        const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesWithMaskPath, ignorePath, errorConfig);
        const result: ResultCliModel = await model.lint();

        // Assert
        assert.deepEqual(assertFullModel, result.errors);
    });
});
