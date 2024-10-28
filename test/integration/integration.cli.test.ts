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

import {
    Cli,
} from './../../src/cli/cli';

import { cliOptions } from './../../src/cli/dictionaries';

import { assertFullModel } from './results/arguments.full';
import { assertAngular17Model } from './results/angular_17.full';
import { assertDefaultModel } from './results/default.full';
import { assertCustomConfig } from './results/custom.config';
import { configValues } from './results/config.values';
import { getAbsolutePath, projectFolder } from './utils';


describe('CLI Integration', () => {
  
});
