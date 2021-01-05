import
{
    MusicSystemBuilder,
    KeyInstruction,
    RhythmInstruction,
    MusicSystem,
    GraphicalMeasure
}
    from "opensheetmusicdisplay";

import { ImcorviseMusicSheetCalculator } from "./ImcorviseMusicSheetCalculator";

export class ImcorviseMusicSystemBuilder extends MusicSystemBuilder
{
    protected addExtraInstructionMeasure
    (
        visStaffIdx: number,
        keyInstruction: KeyInstruction,
        rhythmInstruction: RhythmInstruction
    )
    : number
    {
        const currentSystem: MusicSystem = this.currentSystemParams.currentSystem;
        const measures: GraphicalMeasure[] = [];
        const measure: GraphicalMeasure =
            ImcorviseMusicSheetCalculator.symbolFactory.createExtraGraphicalMeasure(
            currentSystem.StaffLines[visStaffIdx]);
        measures.push(measure);
        if (keyInstruction)
        {
            measure.addKeyAtBegin(keyInstruction, this.activeKeys[visStaffIdx],
                this.activeClefs[visStaffIdx]);
        }
        if (rhythmInstruction !== undefined && rhythmInstruction.PrintObject)
        {
            measure.addRhythmAtBegin(rhythmInstruction);
        }
        measure.PositionAndShape.BorderLeft = 0.0;
        measure.PositionAndShape.BorderTop = 0.0;
        measure.PositionAndShape.BorderBottom = this.rules.StaffHeight;
        const width: number = this.rules.MeasureLeftMargin
            + measure.beginInstructionsWidth + this.rules.MeasureRightMargin;
        measure.PositionAndShape.BorderRight = width;
        currentSystem.StaffLines[visStaffIdx].Measures.push(measure);
        return width;
    }
}
