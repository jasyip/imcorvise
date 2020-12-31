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
import { ImcorviseGraphicalMusicSheet, SelectionMode } from "./ImcorviseGraphicalMusicSheet"


export class ImcorviseMeasure extends VexFlowMeasure
{
    public resetLayout(): void
    {
        this.stave = new ImcorviseStave(this, 0, 0, 0, {
            fill_style: this.rules.StaffLineColor,
            space_above_staff_ln: 0,
            space_below_staff_ln: 0
        });
        
        this.stave.setMeasure(this.MeasureNumber);

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

    //to be destructed into variables to easily access parent classes of measure
    public getData(): object
    {
        const out: object = {};
        out.sheet = this.ParentMusicSystem.Parent.Parent as ImcorviseGraphicalMusicSheet;
        out.staffIndex = this.ParentMusicSystem.StaffLines.indexOf(
                this.ParentStaffLine);
        out.measures = out.sheet.MeasureList.map(row => row[out.staffIndex]);
        out.measureNumber = this.MeasureNumber;
        return out;
    }
    
    public rangeTo(secondIndex: number): void
    {
        const
        {
            sheet: sheet,
            measures: measures,
            staffIndex: staffIndex,
            measureNumber: firstIndex
        } = this.getData();

        if (!sheet.SelectedMeasures)
        {
            sheet.SelectedMeasures = new Array<Set>(sheet.NumberOfStaves);
            for (let i = 0; i < sheet.NumberOfStaves; ++i)
            {
                sheet.SelectedMeasures[i] = new Set();
            }
        }
        if (sheet.PivotStaffIndex === staffIndex)
        {
            for (let measure of measures)
            {
                ((measure as VexFlowMeasure).stave as ImcorviseStave).updateBox();
            }
            for (let i = Math.min(firstIndex, secondIndex) - 1;
                i <= Math.max(firstIndex, secondIndex) - 1; ++i)
            {
                ((measures[i] as VexFlowMeasure).stave as ImcorviseStave).manualUpdate(
                    sheet.SelectionMode === SelectionMode.ADD);
            }
        }
    }
}
