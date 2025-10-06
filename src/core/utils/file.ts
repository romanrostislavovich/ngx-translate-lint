
import chalk from 'chalk';
import { FatalErrorModel } from './../models';
import * as fs from 'node:fs';
import * as path from 'node:path';

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

// tslint:disable-next-line:typedef no-any
function saveJsonFile(data: any, path: string) {
    const jsonSpaces: number = 4;
    fs.writeFileSync(path, JSON.stringify(data,  null, jsonSpaces));
}

export {
    getPackageJsonPath,
    parseJsonFile,
    saveJsonFile,
};
