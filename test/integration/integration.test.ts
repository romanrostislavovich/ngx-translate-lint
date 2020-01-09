import 'mocha';

import path from 'path';
import {assert, expect } from 'chai';

import {
    NgxTranslateLint,
    IRulesConfig, ErrorTypes, ResultCliModel
} from './../../src/core';

import { assertFullModel } from './results/arguments.full';
import { assertDefaultModel } from './results/default.full';
import { assertCustomConfig } from './results/custom.config';

describe('Integration', () => {
    const ignorePath: string = '';

    const projectIgnorePath: string = './test/integration/inputs/views/pipe.keys.html';
    const projectWithMaskPath: string = './test/integration/inputs/views/*.{html,ts}';
    const projectAbsentMaskPath: string = './test/integration/inputs/views/';

    const languagesIgnorePath: string = './test/integration/inputs/locales/EN-eu.json';
    const languagesWithMaskPath: string = './test/integration/inputs/locales/EN-*.json';
    const languagesIncorrectFile: string = './test/integration/inputs/locales/incorrect.json';
    const languagesAbsentMaskPath: string = './test/integration/inputs/locales';

    describe('Warnings', () => {
        it('should be 0 by default', () => {
            // Arrange
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);
            const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesWithMaskPath);
            const result:  ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(0, result.maxCountWarning);
        });
        it('should be error if warnings more thant 2', () => {
            // Arrange
            const errorConfig: IRulesConfig = {
                keysOnViews: ErrorTypes.warning,
                zombieKeys: ErrorTypes.warning,
            };
            const ifFullOfWarning: boolean = true;
            const maxWarnings: number = 5;
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesWithMaskPath, '', errorConfig);
            const result:  ResultCliModel = model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning);
            assert.deepEqual(maxWarnings, result.maxCountWarning);
        });
        it('should be warning if warnings less thant 10', () => {
            // Arrange
            const ifFullOfWarning: boolean = false;
            const maxWarnings: number = 20;
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);
            const ignoreAbsoluteProjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesWithMaskPath);
            const result: ResultCliModel = model.lint(maxWarnings);

            // Assert
            assert.deepEqual(ifFullOfWarning, result.isFullOfWarning);
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
                keysOnViews: ErrorTypes.warning,
                zombieKeys: ErrorTypes.disable,
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result: ResultCliModel = model.lint();

            // Assert
            assert.deepEqual(assertCustomConfig, result.errors);
        });
    });

    it('with full arguments', () => {
        // Arrange
        const errorConfig: IRulesConfig = {
            keysOnViews: ErrorTypes.error,
            zombieKeys: ErrorTypes.warning,
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
