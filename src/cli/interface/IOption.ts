import { IArgv } from "./IArgv";
import { ErrorTypes } from "./../../core";
import { OptionsTypes } from "../enums";

interface IOption {
    short?: string;
    name: keyof IArgv;
    type: OptionsTypes;
    required: boolean;
    default?: string | ErrorTypes;
    descriptionShort: string; // Short, used for usage message
    descriptionLong?: string; // Long, used for `--help`
    possibleValues?: string[] | ErrorTypes[];
}

export { IOption };
