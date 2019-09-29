import path from 'path';
import glob from 'glob';
import dirGlob from 'dir-glob';
import * as _ from 'lodash';

class PathUtils {
    public static resolvePath(filePath: string): string {
        return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    }

    public static getNormalizeFiles(folder: string, ignores: string[] = []): string[] {
        const correctFilesPathList: string[] = dirGlob.sync(PathUtils.resolvePath(folder), {
            extensions: [ 'html', 'ts', 'json']
        });
        const correctIgnorePath: string[] = ignores.map((path: string) => PathUtils.resolvePath(path.trim()));

        const result: string[] = correctFilesPathList.reduce((acum: string[], path: string) => {
            const filesPathList: string[] = glob.sync(path, {
                ignore: correctIgnorePath,
            });
            acum = _.concat(acum, filesPathList);
            return acum;
        }, []);
        return result.map((filePath: string) => {
            return path.normalize(filePath);
        });
    }
}

export { PathUtils };
