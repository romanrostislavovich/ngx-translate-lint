import * as fs from 'node:fs';

// tslint:disable-next-line:no-any
const resourceResolver: any  = {
    get(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            fs.readFile(url, 'utf-8', (err, content) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(content);
                }
            });
        });
    },
    getSync(url: string): string {
        return fs.readFileSync(url).toString();
    }
};

export  {
    resourceResolver
};
