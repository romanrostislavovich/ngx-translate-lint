import 'mocha';

import path from 'path';
import {assert, expect } from 'chai';

import {
    NgxTranslateLint,
    IRulesConfig, ErrorTypes, ResultErrorModel
} from './../../src/core';

import { assertFullModel } from './results/arguments.full';
import { assertCustomConfig } from './results/custom.config';

describe('Integration', () => {
    const relativePathProject: string = './test/integration/inputs/views/*.{html,ts}';
    const relativePathLanguages: string = './test/integration/inputs/locales/*.json';

    describe('Path', () => {
        it('should be relative and absolute', () => {
            // Arrange
            const absolutePathProject: string = path.resolve(__dirname, process.cwd(), relativePathProject);

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, relativePathLanguages);
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
    });

    describe('Config', () => {
        it('should be default', () => {
            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(relativePathProject, relativePathLanguages);
            const result:  ResultErrorModel[] = model.lint();

            // Assert
            assert.deepEqual(assertFullModel, result);
        });
        it('should be inccorect', () => {
            // Arrage
            const errorConfig: object = {
                keysOnViews: 'inccorect',
                anotherInccorectKey: ErrorTypes.disable
            };

            // Act
            const model: NgxTranslateLint = new NgxTranslateLint(relativePathProject, relativePathLanguages, errorConfig as IRulesConfig);

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
            const model: NgxTranslateLint = new NgxTranslateLint(relativePathProject, relativePathLanguages, errorConfig);
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

        // Act
        const model: NgxTranslateLint = new NgxTranslateLint(absolutePathProject, relativePathLanguages, errorConfig);
        const result:  ResultErrorModel[] = model.lint();
        // Assert
        assert.deepEqual(assertFullModel, result);
    });

});
