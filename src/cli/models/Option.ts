import { Argument, IArgument } from 'conventional-cli';

class OptionModel extends Argument {
    constructor(
        args: IArgument
    ) {
        super();

        this.beta = args.beta;
        this.type = args.type;
        this.values = args.values;
        this.default = args.default;
        this.longName = args.longName;
        this.required = args.required;
        this.shortName = args.shortName;
        this.description = args.description;
        this.additionalDescription = args.additionalDescription;
    }

    public getFlag(): string {
        return `${this.shortName ? '-' + this.shortName + ', ' : ''} --${this.longName} [${this.type}] ${this.required ? '(required)' : ''}${this.beta ? '[BETA]' : ''}`;
    }

    public getDescription(): string {
        return (`
        ${this.description}
        ${this.values ? 'Possible Values: <' + this.values.join('|') + '>' : '' }
        `);
    }
}

export { OptionModel };
