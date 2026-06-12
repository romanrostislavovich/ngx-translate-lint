import stringSimilarity, { BestMatch } from 'string-similarity';

import { IRule } from "../interface";
import { ErrorTypes, ErrorFlow } from './../enums';
import { ResultErrorModel, KeyModel } from './../models';

class MisprintRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.misprintKeys;
    public handler: ErrorTypes;
    private readonly maxCoefficient: number;
    private ignoredMisprintKeys: string[] = [];

    constructor(
        handler: ErrorTypes = ErrorTypes.warning,
        coefficient: number = 0.9,
        ignoredMisprintKeys: string[] = []
    ) {
        this.handler = handler;
        this.maxCoefficient = coefficient;
        this.ignoredMisprintKeys = ignoredMisprintKeys;
    }

    public check(viewErrorsKeys: ResultErrorModel[], languagesKeys: KeyModel[]): ResultErrorModel[] {
        const ignoredSet: Set<string> = new Set(this.ignoredMisprintKeys);

        const languagesKeysList: string[] = languagesKeys.map((key: KeyModel) => key.name);

        return viewErrorsKeys.flatMap((key: ResultErrorModel) => {
            if (ignoredSet.has(key.value)) {
                return [];
            }

            const bestMatchModel: BestMatch = stringSimilarity.findBestMatch(key.value, languagesKeysList);

            if (bestMatchModel.bestMatch.rating >= this.maxCoefficient) {
                const bestMatchIndex: number = bestMatchModel.bestMatchIndex;
                const bestMatchName: string = languagesKeys[bestMatchIndex].name;

                if (bestMatchName !== key.value) {
                    return new ResultErrorModel(
                        key.value,
                        this.flow,
                        this.handler,
                        key.currentPath,
                        key.absentedPath,
                        [bestMatchName]
                    );
                }
            }

            return [];
        });
    }

}

export { MisprintRule };
