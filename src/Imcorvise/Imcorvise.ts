import
{
    OpenSheetMusicDisplay,
    MusicSheetCalculator,
    GraphicalMusicSheet
}
    from "opensheetmusicdisplay";

import { ImcorviseMusicSheetCalculator } from "../Graphical/ImcorviseMusicSheetCalculator";
import { ImcorviseGraphicalMusicSheet } from "../Graphical/ImcorviseGraphicalMusicSheet";

export class Imcorvise extends OpenSheetMusicDisplay
{
    public updateGraphic(): void
    {
        const calc: MusicSheetCalculator = new ImcorviseMusicSheetCalculator(this.rules);
        this.graphic = new ImcorviseGraphicalMusicSheet(this.sheet, calc);
        if (this.drawingParameters.drawCursors && this.cursor)
        {
            this.cursor.init(this.sheet.MusicPartManager, this.graphic);
        }
    }

    public render(): void
    {
        super.render();
        this.container.style["pointer-events"] = "none";
        this.container.style["-webkit-touch-callout"] = "none";
        this.container.style["-webkit-user-select"] = "none";
        this.container.style["-khtml-user-select"] = "none";
        this.container.style["-moz-user-select"] = "none";
        this.container.style["-ms-user-select"] = "none";
        this.container.style["user-select"] = "none";
        this.container.addEventListener("contextmenu", e => e.preventDefault());
    }
}
