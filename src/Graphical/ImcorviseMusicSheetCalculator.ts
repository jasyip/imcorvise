import
{
    VexFlowMusicSheetCalculator,
    MusicSheetCalculator,
    EngravingRules
}
    from "opensheetmusicdisplay";

import { ImcorviseGraphicalSymbolFactory } from "./ImcorviseGraphicalSymbolFactory";
import { ImcorviseMusicSystemBuilder } from "./ImcorviseMusicSystemBuilder";

export class ImcorviseMusicSheetCalculator extends VexFlowMusicSheetCalculator
{
    constructor(rules: EngravingRules)
    {
        super(rules);
        MusicSheetCalculator.symbolFactory = new ImcorviseGraphicalSymbolFactory();
    }
}
