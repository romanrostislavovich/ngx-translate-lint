export class Http {
    // tslint:disable-next-line:no-any
    public static async get(url: string): Promise<any> {
        return await fetch(url).then(res => res.json()).then(res => {
            const space: number  = 4;
           const result: string =  JSON.stringify(res, null, space);
           console.log(result);
           return result;
        });
    }
}