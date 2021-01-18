import
{
    VexFlowMusicSheetCalculator,
    MusicSheetCalculator,
    EngravingRules
}
    from "osmd";

import { ImcorviseGraphicalSymbolFactory } from "./ImcorviseGraphicalSymbolFactory";

export class ImcorviseMusicSheetCalculator extends VexFlowMusicSheetCalculator
{
    constructor(rules: EngravingRules)
    {
        super(rules);
        MusicSheetCalculator.symbolFactory = new ImcorviseGraphicalSymbolFactory();
    }
}
