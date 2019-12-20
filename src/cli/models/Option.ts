import { ErrorTypes } from "./../../core";
import { OptionsTypes } from "./../enums";
import { IArgv, IOption } from "./../interface";

class OptionModel implements IOption {
    public short?: string;
    public name: keyof IArgv;
    public type: OptionsTypes;
    public required: boolean = false;
    public default?: string | ErrorTypes;
    public describe: string; // Short, used for usage message
    public description?: string; // Long, used for `--help`
    public possibaleValues?: string[] | ErrorTypes[];

    constructor(
        args: IOption
    ) {
        this.name = args.name;
        this.type = args.type;
        this.describe = args.describe;

        this.short = args.short;
        this.required = args.required;
        this.default = args.default;
        this.description = args.description;
        this.possibaleValues = args.possibaleValues;
    }

    public getFlag(): string {
        return `${this.short ? '-' + this.short + ', ' : ''} --${this.name} [${this.type}] ${this.required ? '(required)' : ''}`;
    }

    public getDescription(): string {
        return (`
        ${this.describe}
        ${this.possibaleValues ? 'Possibale Values: <' + this.possibaleValues.join('|') + '>' : '' }
        `);
    }
}

export { OptionModel };
