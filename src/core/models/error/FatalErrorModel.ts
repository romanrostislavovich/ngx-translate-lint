class FatalErrorModel extends Error {
    public static NAME: string = "FatalError";
    constructor(public message: string, public innerError?: Error) {
        super(message);
        this.name = FatalErrorModel.NAME;

        // Fix prototype chain for target ES5
        Object.setPrototypeOf(this, FatalErrorModel.prototype);
    }
}

export { FatalErrorModel };
