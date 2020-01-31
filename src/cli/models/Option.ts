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
        const typeTemplate: string = `[${this.type}] `;
        const betaTemplate: string = this.beta ? '[BETA] ' : '';
        const requiredTemplate: string = this.required ? '(required) ' : '';
        const longNameTemplate: string = `--${this.longName} `;
        const shortNameTemplate: string = this.shortName ? '-' + this.shortName + ', ' : '';
        return `${shortNameTemplate}${longNameTemplate}${typeTemplate}${requiredTemplate}${betaTemplate}`;
    }

    public getDescription(): string {
        const descriptionTemplate: string = `${this.description}`;
        const possibleValuesTemplate: string = this.values ? 'Possible Values: <' + this.values.join('|') + '>' : '';
        return (`
        ${descriptionTemplate}
        ${possibleValuesTemplate}
        `);
    }
}

export { OptionModel };
