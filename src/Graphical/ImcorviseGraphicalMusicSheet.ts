import
{
    GraphicalMusicSheet,
    GraphicalMeasure
}
    from "opensheetmusicdisplay";

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
}

export enum SelectionMode
{
    ADD,
    REMOVE
}
