interface IArgv {
    project: string;
    languages: string;
    views?: string;
    zombies?: string;
    emptyKeys?: string;
    help?: boolean;
    version?: boolean;
    ignore?: string;
    maxWarning?: number;
    misprint?: number;
    config?: object;
    misprintCoefficient?: number;
}

export { IArgv };
