class KeyModelWithLanguages {
    public name: string;
    public views: ViewModelWithKey[] = [];
    public languages: LanguagesModelWithKey[] = [];

    constructor(name: string, languages: LanguagesModelWithKey[] = [], views: ViewModelWithKey[] = []) {
        this.name = name;
        this.views = views;
        this.languages = languages;
    }
}

class ViewModelWithKey {
    public name: string;
    public path: string;

    constructor(path: string, name: string = '') {
        this.name = name;
        this.path = path;
    }
}

class LanguagesModelWithKey {
    public name: string;
    public path: string;
    public keyValue: string;

    constructor(name: string, path: string, keyValue: string) {
        this.name = name;
        this.path = path;
        this.keyValue = keyValue;
    }
}

export { KeyModelWithLanguages, ViewModelWithKey, LanguagesModelWithKey };
