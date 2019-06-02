class KeyModel {
    public name: string;

    public views: string[] = [];
    public languages: string[] = [];

    constructor(name: string, views: string[] = [], languages: string[] = []) {
        this.name = name;
        this.views = views;
        this.languages = languages;
    }
}

export { KeyModel };
