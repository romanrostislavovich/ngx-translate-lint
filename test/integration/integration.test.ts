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
    const relativePathProject: string = './test/integration/inputs/views/*.{html,ts}';
    const relativePathLanguages: string = './test/integration/inputs/locales/EN-*.json';
    const ignoreRelativeProject: string = './test/integration/inputs/views/pipe.keys.html';
    const ignoreRelativeLanguage: string = './test/integration/inputs/locales/EN-eu.json';
    const incorrectRelativePathLanguages: string = './test/integration/inputs/locales/incorrect.json';

    describe('Ignore', () => {
        it('should be relative and absolute and have projects and languages files', () => {
            // Arrage
            const ignoreAbsolutePorjectPath: string = path.resolve(__dirname, process.cwd(), ignoreRelativeProject);
            const ignorePath: string = `${ignoreRelativeLanguage}, ${ignoreAbsolutePorjectPath}`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(relativePathProject, relativePathLanguages, ignorePath);
            const result: ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result);
        });

        it('should be empty or incorrect', () => {
            // Arrage
            const ignorePath: string = `null, 0, undefined, '',`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(relativePathProject, relativePathLanguages, ignorePath);
            const result: ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result);
        });
    });
    describe('Path', () => {
        it('should be relative and absolute', () => {
            // Arrange
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), relativePathProject);

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, relativePathLanguages);
            const result: ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertDefaultModel, result);
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
            const absoluteIncorrectLanguagesPath: string = path.resolve(__dirname, process.cwd(), incorrectRelativePathLanguages);
            const errorMessage: string = `Can't parse JSON file: ${absoluteIncorrectLanguagesPath}`;

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(relativePathProject, incorrectRelativePathLanguages);

            // Assert
            // model.lint();
            assert.throws(() => { model.lint(); }, errorMessage);
        });
    });

    describe('Config', () => {
        it('should be default', () => {
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(relativePathProject, relativePathLanguages);
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
            const model: NgxTranslateLint = new NgxTranslateLint(relativePathProject, relativePathLanguages, ignorePath, errorConfig as IRulesConfig);

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
            const model: NgxTranslateLint = new NgxTranslateLint(relativePathProject, relativePathLanguages, ignorePath, errorConfig);
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
        const absolutePathProject: string = path.resolve(__dirname, process.cwd(), relativePathProject);
        const ignoreAbsolutePorjectPath: string = path.resolve(__dirname, process.cwd(), ignoreRelativeProject);
        const ignorePath: string = `${ignoreRelativeLanguage}, ${ignoreAbsolutePorjectPath}`;

        // Act
        const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, relativePathLanguages, ignorePath, errorConfig);
        const result:  ResultErrorModel[] = model.lint();

        // Assert
        assert.deepEqual(assertFullModel, result);
    });

});
