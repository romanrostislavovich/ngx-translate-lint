import stringSimilarity, { BestMatch } from 'string-similarity';

import { IRule } from "../interface";
import { ErrorTypes, ErrorFlow } from './../enums';
import { ResultErrorModel, KeyModel } from './../models';

class MisprintRule implements IRule {
    public flow: ErrorFlow = ErrorFlow.misprint;
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
        const languagesKeysList: string[] = languagesKeys.map((key: KeyModel) => key.name);
        const resultErrorList: ResultErrorModel[] = viewErrorsKeys.reduce((result: ResultErrorModel[], key: ResultErrorModel) => {
            if (this.ignoredMisprintKeys.includes(key.value)) {
                return result;
            }
            const bestMatchModel: BestMatch = stringSimilarity.findBestMatch(key.value, languagesKeysList);
            const bestMatchIndex: number = bestMatchModel.bestMatch.rating >= this.maxCoefficient ? bestMatchModel.bestMatchIndex : -1;
            if (bestMatchIndex !== -1 && languagesKeys[bestMatchIndex].name !== key.value) {
                const error: ResultErrorModel = new ResultErrorModel(key.value, this.flow, this.handler, key.currentPath, key.absentedPath, [
                    `${languagesKeys[bestMatchIndex].name}`
                ]);
                result.push(error);
            }
            return result;
        }, []);
        return resultErrorList;
    }

}

export { MisprintRule };
