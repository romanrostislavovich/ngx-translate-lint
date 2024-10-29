import 'mocha';

<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 314e6d4... fix: small fix
describe('CLI Integration', () => {

=======
=======
>>>>>>> abe8a0c... fix: Override values from settings-file via CLI
=======
>>>>>>> c03391b... fix: Override values from settings-file via CLI
=======
>>>>>>> 75d8deb... fix: Override values from settings-file via CLI
=======
describe('CLI Integration', () => {

=======
>>>>>>> b88e3ff... fix: Override values from settings-file via CLI
=======
>>>>>>> abe8a0c... fix: Override values from settings-file via CLI
=======
>>>>>>> c03391b... fix: Override values from settings-file via CLI
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
  
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> c03391b... fix: Override values from settings-file via CLI
=======
describe('CLI Integration', () => {

>>>>>>> 846af48... fix: small fix
=======
>>>>>>> abe8a0c... fix: Override values from settings-file via CLI
=======
describe('CLI Integration', () => {

>>>>>>> a0bf154... fix: small fix
=======
>>>>>>> c03391b... fix: Override values from settings-file via CLI
=======
describe('CLI Integration', () => {

>>>>>>> 846af48... fix: small fix
=======
>>>>>>> 75d8deb... fix: Override values from settings-file via CLI
=======
describe('CLI Integration', () => {

>>>>>>> a29b98e... fix: small fix
=======
>>>>>>> c03391b... fix: Override values from settings-file via CLI
<<<<<<< HEAD
>>>>>>> b88e3ff... fix: Override values from settings-file via CLI
=======
=======
describe('CLI Integration', () => {

>>>>>>> 846af48... fix: small fix
>>>>>>> 314e6d4... fix: small fix
=======
>>>>>>> abe8a0c... fix: Override values from settings-file via CLI
=======
describe('CLI Integration', () => {

>>>>>>> a0bf154... fix: small fix
=======
>>>>>>> c03391b... fix: Override values from settings-file via CLI
=======
describe('CLI Integration', () => {

>>>>>>> 846af48... fix: small fix
=======
describe('CLI Integration', () => {

>>>>>>> 51324e4... fix: comit
});
