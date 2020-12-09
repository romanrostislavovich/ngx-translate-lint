import { KeyModel } from './KeyModel';

export class LanguagesModel {
    public name: string;
    public path: string = '';
    public keys: KeyModel[] = [];

    constructor(name: string) {
        this.name = name;
    }
}
