interface IArgv {
    project: string;
    languages: string;
    views?: string;
    zombies?: string;
    help?: boolean;
    version?: boolean;
    ignore?: string;
    maxWarning?: number;
    misprint?: number;
    misprintCoefficient?: number;
}

export { IArgv };
