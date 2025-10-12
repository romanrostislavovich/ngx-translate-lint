import { IFetch } from '../interface';
import * as _ from 'lodash';

export class Http {
    // tslint:disable-next-line:no-any
    public static async get(url: string, fetchSettings?: IFetch): Promise<any> {
        const correctURL: string = fetchSettings?.requestQuery ? `${url}${fetchSettings.responseQuery}` : url;
        const correctHeaders: { [key: string]: string }  = _.isEmpty(fetchSettings?.requestHeaders) && fetchSettings?.requestHeaders ? fetchSettings.requestHeaders : {};
        return await fetch(correctURL, {
            headers: {
                ...correctHeaders
            }
        }).then(res => res.json()).then(res => {
            const space: number  = 4;
            const result: any = fetchSettings?.responseQuery ? res[fetchSettings.responseQuery] : res;
            return  JSON.stringify(result, null, space);
        });
    }
}