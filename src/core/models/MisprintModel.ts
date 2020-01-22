import { ErrorTypes } from './../enums';
import { IMisprint } from '../interface';

class MisprintModel implements IMisprint {
    public type: ErrorTypes;
    public coefficient: number;
    constructor(
        type: ErrorTypes = ErrorTypes.warning,
        coefficient: number = 0.9
    ) {
        this.type = type;
        this.coefficient = coefficient;
    }
}

export { MisprintModel };
