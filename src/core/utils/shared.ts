import { ResourceResolver } from 'ngast';
import { readFileSync, readFile } from 'fs';

const resourceResolver: ResourceResolver = {
    get(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(url, 'utf-8', (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });
    },
    getSync(url: string): string {
        return readFileSync(url).toString();
    }
};

export  {
    resourceResolver
};
