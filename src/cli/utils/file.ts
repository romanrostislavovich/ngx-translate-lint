import * as fs from 'fs';
import * as path from 'path';

import chalk from 'chalk';

import { FatalErrorModel } from '../../core';

const packageJsonPath: string = './package.json';

// tslint:disable-next-line:no-any
function parseJsonFile(filePath: string): any {
    if (!fs.existsSync(filePath)) {
        throw new FatalErrorModel(chalk.red(`File doesn't exists by path ${filePath}`));
    }
    const configFile: Buffer = fs.readFileSync(filePath);
    // tslint:disable-next-line:no-any
    const result: any = JSON.parse(configFile.toString());
    return result;
}

function getPackageJsonPath(): string {
    const result: string = path.resolve(__dirname,  '../../../../', packageJsonPath);
    return result;
}

export {
    getPackageJsonPath,
    parseJsonFile
};
