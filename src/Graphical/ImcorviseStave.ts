import Vex from "vexflow";

import 
{
    StaffLine,
    MusicSystem,
    GraphicalMeasure
}
    from "opensheetmusicdisplay";

import { ImcorviseGraphicalMusicSheet, SelectionMode } from "./ImcorviseGraphicalMusicSheet"
import { ImcorviseMeasure } from "./ImcorviseMeasure";


const COLOR_STATE: string[][] =
[
    //untouched and unselected, touched and unselected
    ["none", "#444444"],
    //untouched and selected, touched and selected,
    ["#7FBFFF", "#666699"]
];


export class ImcorviseStave extends Vex.Flow.Stave
{

    private touched: boolean;
    private readonly boxElement: SVGSVGElement;
    private readonly parentIMeasure: ImcorviseMeasure;

    constructor
    (
        parentIMeasure: ImcorviseMeasure,
        x: number,
        y: number,
        width: number,
        options: object
    )
    {
        super(x, y, width, options);
        this.parentIMeasure = parentIMeasure;
        this.touched = false;
    }

    public get Touched(): boolean
    {
        return this.touched;
    }
    public set Touched(value: boolean)
    {
        this.touched = value;
    }
    public get ParentIMeasure()
    {
        return this.parentIMeasure;
    }


    private onmousedown(event): void
    {
        const currentMeasure: ImcorviseStave = event.currentTarget.measure;
        if ([1, 3].includes(event.which))
        {
            const
            {
                sheet: sheet,
                measureNumber: measureNumber,
                staffIndex: staffIndex
            } = currentMeasure.ParentIMeasure.getData();

            sheet.PivotMeasure = measureNumber;
            sheet.PivotStaffIndex = staffIndex;
            sheet.SelectionMode = event.which === 1 ? SelectionMode.ADD : SelectionMode.REMOVE;
            currentMeasure.parentIMeasure.rangeTo(measureNumber);
        }
    }

    private onmouseup(event): void
    {
        const currentMeasure: ImcorviseStave = event.currentTarget.measure;
        const
        {
            sheet: sheet,
            measureNumber: measureNumber,
            staffIndex: staffIndex
        } = currentMeasure.ParentIMeasure.getData();
        if ([1, 3].includes(event.which) && sheet.PivotStaffIndex === staffIndex)
        {

            for (let i = Math.min(sheet.PivotMeasure, measureNumber);
                i <= Math.max(sheet.PivotMeasure, measureNumber); ++i)
            {
                if (event.which === 1)
                {
                    sheet.SelectedMeasures[staffIndex].add(i);
                }
                else if (event.which === 3)
                {
                    sheet.SelectedMeasures[staffIndex].delete(i);
                }
            }
            sheet.resetSelection();
        }
        else
        {
            for (let measure of sheet.MeasureList.flat(1))
            {
                ((measure as VexFlowMeasure).getVFStave() as ImcorviseStave).updateBox();
            }
        }
        event.stopPropagation();
    }

    private onmouseenter(event): void
    {
        const currentMeasure: ImcorviseStave = event.currentTarget.measure;
        currentMeasure.Touched = true;
        const
        {
            sheet: sheet,
            staffIndex: staffIndex,
            measures: measures,
            measureNumber: measureNumber
        } = currentMeasure.ParentIMeasure.getData();
        if ([1, 2].includes(event.buttons & 0b00011) && sheet.PivotStaffIndex === staffIndex)
        { 
            (measures[sheet.PivotMeasure - 1] as ImcorviseMeasure).rangeTo(measureNumber);
        }
        else
        {
            currentMeasure.updateBox();
        }
    }

    private onmouseleave(event): void
    {
        const currentMeasure: ImcorviseStave = event.currentTarget.measure;
        currentMeasure.Touched = false;
        const
        {
            sheet: sheet,
            staffIndex: staffIndex,
            measures: measures,
            measureNumber: measureNumber
        } = currentMeasure.ParentIMeasure.getData();

        currentMeasure.updateBox();
    }

    public manualUpdate(selected: boolean): void
    {
        const color: string = COLOR_STATE[+this.touched][+selected];
        this.boxElement.style.stroke = color;
        this.boxElement.style.fill = color;
    }
    
    public updateBox(): void
    {
        const
        {
            sheet: sheet,
            measureNumber: measureNumber,
            staffIndex: staffIndex
        } = this.parentIMeasure.getData();
        if (sheet.SelectedMeasures)
        {
            this.manualUpdate(sheet.SelectedMeasures[staffIndex].has(measureNumber));
        }
        else
        {
            this.manualUpdate(false);
        }
    }

    public enableInteraction(): void
    {
        this.boxElement.addEventListener("mousedown", this.onmousedown);
        this.boxElement.addEventListener("mouseup", this.onmouseup);
        this.boxElement.addEventListener("mouseenter", this.onmouseenter);
        this.boxElement.addEventListener("mouseleave", this.onmouseleave);
    }

    public disableInteraction(): void
    {
        this.boxElement.removeEventListener("mousedown", this.onmousedown);
        this.boxElement.removeEventListener("mouseup", this.onmouseup);
        this.boxElement.removeEventListener("mouseenter", this.onmouseenter);
        this.boxElement.removeEventListener("mouseleave", this.onmouseleave);
    }

    public draw(): void
    {    
        this.checkContext();
        this.setRendered();

        if (!this.formatted)
        {
            this.format();
        }

        const num_lines = this.options.num_lines;

        // Render lines
        for (let line = 0; line < num_lines; ++line)
        {
            let y = this.getYForLine(line);
            this.applyStyle();
            if (this.options.line_config[line].visible)
            {
                this.context.beginPath();
                this.context.moveTo(this.x, y);
                this.context.lineTo(this.x + this.width, y);
                this.context.stroke();
            }
            this.restoreStyle();
        }

        // Draw the modifiers (bar lines, coda, segno, repeat brackets, etc.)
        for (let i = 0; i < this.modifiers.length; ++i)
        {
          // Only draw modifier if it has a draw function
            if (typeof this.modifiers[i].draw === 'function')
            {
                this.modifiers[i].applyStyle();
                this.modifiers[i].draw(this, this.getModifierXShift(i));
                this.modifiers[i].restoreStyle();
            }
        }

        this.applyStyle();
        this.context.rect(
            this.x,
            this.getTopLineTopY(),
            this.width,
            this.getBottomLineBottomY() - this.getTopLineTopY()
        );
        this.restoreStyle();

        if (this.context.svg)
        {
            this.boxElement = this.context.svg.lastElementChild;
            this.boxElement.style.pointerEvents = "all";
            this.boxElement.style.fillOpacity = 0.3;
            this.boxElement.measure = this;
            this.enableInteraction();
            this.manualUpdate(false);
        }

        return this;
    }
}
