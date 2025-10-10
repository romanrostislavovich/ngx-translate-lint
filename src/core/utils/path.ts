import * as path from 'node:path';
import * as glob from 'glob';
import dirGlob from 'dir-glob';
import * as _ from 'lodash';
import * as os from 'node:os';

class PathUtils {
    public static resolvePath(filePath: string): string {
        return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    }

    public static getNormalizeFiles(folder: string, ignores: string[] = []): string[] {
        const globPath: string = PathUtils.resolvePath(folder);
        const correctFilesPathList: string[] = dirGlob.sync(globPath, {
            extensions: [ 'html', 'ts', 'json']
        }).map((path) => {
            if (os.platform().includes('win')) {
                return path.replaceAll('\\', '/');
            }
            return path;
        });

        const correctIgnorePath: string[] = ignores.map((path: string) => PathUtils.resolvePath(path.trim()));


        const result: string[] = correctFilesPathList.reduce((acum: string[], path: string) => {
            const filesPathList: string[] = glob.globSync(path, {
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
