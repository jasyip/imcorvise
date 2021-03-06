import
{
    GraphicalMusicSheet,
    GraphicalMeasure
}
    from "osmd";

import { ImcorviseStave } from "./ImcorviseStave";

export class ImcorviseGraphicalMusicSheet extends GraphicalMusicSheet
{
    public SelectedMeasures: Set[];
    public PivotMeasure: number | null;
    public PivotStaffIndex: number | null;
    public SelectionMode: SelectionMode | null;

    constructor(musicSheet: MusicSheet, calculator: MusicSheetCalculator)
    {
        super(musicSheet, calculator);
        this.resetSelection();
    }
    
    public resetSelection(): void
    {
        this.PivotMeasure = null;
        this.PivotStaffIndex = null;
        this.SelectionMode = null;
    }

    public forceUpdate(): void
    {
        for (let measure of this.MeasureList.flat(1))
        {
            if (measure)
            {
                ((measure as ImcorviseMeasure).getVFStave() as ImcorviseStave).updateBox();
            }
        }
    }
    
    public enableInteraction(): void
    {
        for (let measure of this.MeasureList.flat(1))
        {
            if (measure)
            {
                (measure.getVFStave() as ImcorviseStave).enableInteraction();
            }
        }
    }

    public disableInteraction(): void
    {
        for (let measure of this.MeasureList.flat(1))
        {
            if (measure)
            {
                (measure.getVFStave() as ImcorviseStave).disableInteraction();
            }
        }
    }
}

export enum SelectionMode
{
    ADD,
    REMOVE
}
