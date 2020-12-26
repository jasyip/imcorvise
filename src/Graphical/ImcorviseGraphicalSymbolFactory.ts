import
{
    VexFlowGraphicalSymbolFactory,
    SourceMeasure,
    Staff,
    StaffLine
}
    from "opensheetmusicdisplay";

import { ImcorviseMeasure } from "./ImcorviseMeasure"

export class ImcorviseGraphicalSymbolFactory extends VexFlowGraphicalSymbolFactory
{
    public createGraphicalMeasure
    (
        sourceMeasure: SourceMeasure,
        staff: Staff,
        isTabMeasure: boolean = false
    )
    : GraphicalMeasure
    {
        return new ImcorviseMeasure(staff, sourceMeasure, undefined);
    }

    public createExtraGraphicalMeasure(staffLine: StaffLine): GraphicalMeasure
    {
        return new ImcorviseMeasure(staffLine.ParentStaff, undefined, staffLine);
    }
}
