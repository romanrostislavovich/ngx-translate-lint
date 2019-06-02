declare class ErrorModel {
    public name?: string;
    public message: string;
    public stack?: string;
    constructor(message?: string);
}

export { ErrorModel };
