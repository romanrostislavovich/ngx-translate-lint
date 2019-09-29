import 'mocha';

import path from 'path';
import {assert, expect } from 'chai';

import {
    NgxTranslateLint,
    IRulesConfig, ErrorTypes, ResultErrorModel
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

    describe('Ignore', () => {
        it('should be relative and absolute and have projects and languages files', () => {
            // Arrage
            const ignoreAbsolutePorjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
            const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsolutePorjectPath}`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath);
            const result: ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result);
        });

        it('should be empty or incorrect', () => {
            // Arrage
            const ignorePath: string = `null, 0, undefined, '',`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath);
            const result: ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result);
        });
    });
    describe('Path', () => {
        it('should be relative and absolute', () => {
            // Arrange
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesWithMaskPath);
            const result: ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result);
        });

        it('should be absent mask', () => {
            // Arrage
            const ignorePath: string = `${languagesIgnorePath}, ${projectIgnorePath}, ${languagesIncorrectFile}`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectAbsentMaskPath, languagesAbsentMaskPath, ignorePath);
            const result: ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result);
        });
        it('should be empty and incorect', () => {
            // Arrange
            const emptyFolder: string = '';
            const inccorectFolder: string = '../files';

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(emptyFolder, inccorectFolder);

            // Assert
            expect(() => { model.lint(); }).to.throw();
        });

        it('should with parse error', () => {
            // Arrage
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
            const result:  ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result);
        });
        it('should be inccorect', () => {
            // Arrage
            const errorConfig: object = {
                keysOnViews: 'inccorect',
                anotherInccorectKey: ErrorTypes.disable
            };


            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig as IRulesConfig);

            // Assert
            expect(() => { model.lint(); }).to.throw();
        });
        it('should be custom', () => {
            // Arrage
            const errorConfig: IRulesConfig = {
                keysOnViews: ErrorTypes.warning,
                zombieKeys: ErrorTypes.disable,
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(projectWithMaskPath, languagesWithMaskPath, ignorePath, errorConfig);
            const result:  ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertCustomConfig, result);
        });
    });

    it('with full arguments', () => {
        // Arrange
        const errorConfig: IRulesConfig = {
            keysOnViews: ErrorTypes.error,
            zombieKeys: ErrorTypes.warning,
        };
        const absolutePathProject: string = path.resolve(__dirname, process.cwd(), projectWithMaskPath);
        const ignoreAbsolutePorjectPath: string = path.resolve(__dirname, process.cwd(), projectIgnorePath);
        const ignorePath: string = `${languagesIgnorePath}, ${ignoreAbsolutePorjectPath}`;

        // Act
        const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, languagesWithMaskPath, ignorePath, errorConfig);
        const result:  ResultErrorModel[] = model.lint();

        // Assert
        assert.deepEqual(assertFullModel, result);
    });

});
