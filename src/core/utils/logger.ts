import { ILogger } from "../interface";

const logger: ILogger = {
    log(m: string): void {
        process.stdout.write(m);
    },
    error(m: string): void {
        process.stderr.write(m);
    },
};

export { logger };
