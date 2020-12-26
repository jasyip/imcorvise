import
{
    VexFlowMeasure,
    Staff,
    SourceMeasure,
    StaffLine,
    SystemLinesEnum
}
    from "opensheetmusicdisplay";
import Vex from "vexflow";

import { ImcorviseStave } from "./ImcorviseStave";


export class ImcorviseMeasure extends VexFlowMeasure
{
/*
    constructor
    (
        staff: Staff,
        sourceMeasure: SourceMeasure = undefined,
        staffLine: StaffLine = undefined
    )
    {
        super(staff, sourceMeasure, staffLine);
    }
*/

    public resetLayout(): void
    {
        this.stave = new ImcorviseStave(0, 0, 0,{
            fill_style: this.rules.StaffLineColor,
            space_above_staff_ln: 0,
            space_below_staff_ln: 0
        });
        
        if (this.ParentStaff)
        {
            this.setLineNumber(this.ParentStaff.StafflineCount);
        }

        this.stave.setBegBarType(Vex.Flow.Barline.type.NONE);
        if (this.parentSourceMeasure
                && this.parentSourceMeasure.endingBarStyleEnum === SystemLinesEnum.NONE)
        {
            this.stave.setEndBarType(Vex.Flow.Barline.type.NONE);
        }

        this.updateInstructionWidth();
    }
}
