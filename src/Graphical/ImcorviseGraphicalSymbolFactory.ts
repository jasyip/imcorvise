import
{
    VexFlowGraphicalSymbolFactory,
    SourceMeasure,
    Staff,
    StaffLine,
    VexFlowMeasure
}
    from "osmd";

import { ImcorviseMeasure } from "./ImcorviseMeasure";
import { ImcorviseMultiRestMeasure } from "./ImcorviseMultiRestMeasure";

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

    public createMultiRestMeasure
    (
        sourceMeasure: SourceMeasure,
        staff: Staff,
        staffLine?: StaffLine
    )
    : GraphicMeasure
    {
        return new ImcorviseMultiRestMeasure(staff, sourceMeasure, staffLine);
    }

    public createExtraGraphicalMeasure(staffLine: StaffLine): GraphicalMeasure
    {
        return new ImcorviseMeasure(staffLine.ParentStaff, undefined, staffLine);
    }
}
