class KeyModel {
    public name: string;
    public value: string = '';
    public views: string[] = [];
    public languages: string[] = [];

    constructor(name: string, views: string[] = [], languages: string[] = [], value: string = '') {
        this.name = name;
        this.value = value;
        this.views = views;
        this.languages = languages;
    }
}

export { KeyModel };
