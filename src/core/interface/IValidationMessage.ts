interface IValidationMessage {
    value?: string;
    readonly message: string[] | string | null;
}

export { IValidationMessage };
