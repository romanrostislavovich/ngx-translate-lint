import path from 'path';
import { ResultErrorModel } from '../../src/core';

const projectFolder: string = path.resolve(__dirname, './inputs/views/');
const languagesFolder: string = path.resolve(__dirname, './inputs/locales/');

function getAbsolutePath(relativeFolder: string, fileName: string): string {
    return path.normalize(path.resolve(process.cwd(), relativeFolder, fileName));
}

function sortResult(result:ResultErrorModel[]): ResultErrorModel[] {
    return result.sort((a, b) => {
        if (a.value + a.currentPath > b.value + b.currentPath)  return 1;
        if (a.value + a.currentPath < b.value + b.currentPath) return -1;
        return 0;
    });
}
export { projectFolder, languagesFolder, getAbsolutePath, sortResult };
