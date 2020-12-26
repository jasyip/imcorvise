import
{
    OpenSheetMusicDisplay,
    GraphicalMusicSheet
}
    from "opensheetmusicdisplay";

import { ImcorviseMusicSheetCalculator } from "../Graphical/ImcorviseMusicSheetCalculator";

export class Imcorvise extends OpenSheetMusicDisplay
{
    
    /*
    constructor
    (
        container: string | HTMLElement,
        options: IOSMDOptions = OSMDOptions.OSMDOptionsStandard()
    )
    {
        super(container, options);
    }
    */

    public updateGraphic(): void
    {
        const calc: MusicSheetCalculator = new ImcorviseMusicSheetCalculator(this.rules);
        this.graphic = new GraphicalMusicSheet(this.sheet, calc);
        if (this.drawingParameters.drawCursors && this.cursor)
        {
            this.cursor.init(this.sheet.MusicPartManager, this.graphic);
        }
    }

}
