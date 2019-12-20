import { ErrorTypes } from 'src/core';
import { OptionsTypes } from 'src/cli/enums';
import { IArgv, IOption } from 'src/cli/interface';

class OptionModel implements IOption {
    public short?: string;
    public name: keyof IArgv;
    public type: OptionsTypes;
    public required: boolean = false;
    public default?: string | ErrorTypes;
    public possibleValues?: string[] | ErrorTypes[];
    public descriptionLong?: string;
    public descriptionShort: string;

    constructor(
        args: IOption
    ) {
        this.name = args.name;
        this.type = args.type;
        this.descriptionShort = args.descriptionShort;

        this.short = args.short;
        this.required = args.required;
        this.default = args.default;
        this.descriptionLong = args.descriptionLong;
        this.possibleValues = args.possibleValues;
    }

    public getFlag(): string {
        return `${this.short ? '-' + this.short + ', ' : ''} --${this.name} [${this.type}] ${this.required ? '(required)' : ''}`;
    }

    public getDescription(): string {
        return (`
        ${this.descriptionShort}
        ${this.possibleValues ? 'Possible Values: <' + this.possibleValues.join('|') + '>' : '' }
        `);
    }
}

export { OptionModel };
