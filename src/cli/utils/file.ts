import * as fs from 'fs';
import chalk from 'chalk';

import { FatalErrorModel } from '../../core';

// tslint:disable-next-line:no-any
function parseJsonFile(configPath: string): any {
    if (!fs.existsSync(configPath)) {
        throw new FatalErrorModel(chalk.red(`Config file doesn't exists by path ${configPath}`));
    }
    const configFile: Buffer = fs.readFileSync(configPath);
    // tslint:disable-next-line:no-any
    const result: any = JSON.parse(configFile.toString());
    return result;
}

export {
    parseJsonFile
};
