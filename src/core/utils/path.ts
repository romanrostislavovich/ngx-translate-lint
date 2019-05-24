import path from 'path';
import glob from 'glob';

class PathUtils {
    public static resolvePath(filePath: string): string {
        return path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    }

    public static getNormalizeFiles(folder: string): string[] {
        const correctPath: string = PathUtils.resolvePath(folder);
        return glob.sync(correctPath).map((filePath: string) => {
            return path.normalize(filePath);
         });
    }
}

export { PathUtils };
