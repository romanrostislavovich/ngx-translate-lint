import { IArgv } from "./IArgv";
import { ErrorTypes } from "./../../core";
import { OptionsTypes } from "../enums";

interface IOption {
    short?: string;
    name: keyof IArgv;
    type: OptionsTypes;
    required: boolean;
    default?: string | ErrorTypes;
    describe: string; // Short, used for usage message
    description?: string; // Long, used for `--help`
    possibaleValues?: string[] | ErrorTypes[];
}

export { IOption };
