import stringSimilarity, { BestMatch } from 'string-similarity';

import { IRule } from "../interface";
import { ErrorTypes, ErrorFlow } from './../enums';
import { ResultErrorModel, KeyModel } from './../models';

class MisprintRule implements IRule {
    private maxRaiting: number = 0.9;
    public flow: ErrorFlow = ErrorFlow.misprint;
    public handler: ErrorTypes;

    constructor(
        handler: ErrorTypes = ErrorTypes.warning
    ) {
        this.handler = handler;
    }

    public check(viewErrorsKeys: ResultErrorModel[], languagesKeys: KeyModel[]): ResultErrorModel[] {
        const languagesKeysList: string[] = languagesKeys.map((key: KeyModel) => key.name);
        const resultErrorList: ResultErrorModel[] = viewErrorsKeys.reduce((result: ResultErrorModel[], key: ResultErrorModel) => {
            const bestMatchModel: BestMatch = stringSimilarity.findBestMatch(key.value, languagesKeysList);
            const bestMatchIndex: number = bestMatchModel.bestMatch.rating >= this.maxRaiting ? bestMatchModel.bestMatchIndex : -1;
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
