#!/usr/bin/env node

import { Cli } from './cli';
import { cliOptions } from './dictionaries';

(async() => {
   await Cli.run(cliOptions);
})();

