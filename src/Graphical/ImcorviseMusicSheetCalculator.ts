import
{
    VexFlowMusicSheetCalculator,
    MusicSheetCalculator,
    EngravingRules
}
    from "opensheetmusicdisplay";

import { ImcorviseGraphicalSymbolFactory } from "./ImcorviseGraphicalSymbolFactory";


export class ImcorviseMusicSheetCalculator extends VexFlowMusicSheetCalculator
{
    constructor(rules: EngravingRules)
    {
        super(rules);
        MusicSheetCalculator.symbolFactory = new ImcorviseGraphicalSymbolFactory();
    }
}
