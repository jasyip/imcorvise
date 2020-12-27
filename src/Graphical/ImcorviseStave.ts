import Vex from "vexflow";

import { VexFlowMeasure } from "opensheetmusicdisplay";

export class ImcorviseStave extends Vex.Flow.Stave
{

    constructor
    (
        parentVFMeasure: VexFlowMeasure,
        x: number,
        y: number,
        width: number,
        options: object = {}
    )
    {
        super(x, y, width, options);
        this.parentVFMeasure = parentVFMeasure;    
    }



    private onmousedown(): void
    {
        //console.log(this.measure.parentVFMeasure);
    }

    private onmouseup(): void
    {
        
    }

    private onmouseenter(event): void
    {
        //console.log(event.button);
        this.style.stroke = "red"
        
    }

    private onmouseleave(event): void
    {
        //console.log(event.button);
        this.style.stroke = "none";
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
        for (let line = 0; line < num_lines; ++line) {
            let y = this.getYForLine(line);
            this.applyStyle();
            if (this.options.line_config[line].visible) {
                this.context.beginPath();
                this.context.moveTo(this.x, y);
                this.context.lineTo(this.x + this.width, y);
                this.context.stroke();
            }
            this.restoreStyle();
        }

        // Draw the modifiers (bar lines, coda, segno, repeat brackets, etc.)
        for (let i = 0; i < this.modifiers.length; ++i) {
          // Only draw modifier if it has a draw function
            if (typeof this.modifiers[i].draw === 'function') {
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
                this.getBottomLineBottomY() - this.getTopLineTopY(),
                {
                    fill: "none",
                    stroke: "none",
                }
        );
        this.restoreStyle();

        if (this.context.svg)
        {
            let addedElement = this.context.svg.lastElementChild;
            addedElement.style.pointerEvents = "all";
            addedElement.onmousedown = this.onmousedown;
            addedElement.onmouseup = this.onmouseup;
            addedElement.onmouseenter = this.onmouseenter;
            addedElement.onmouseleave = this.onmouseleave;
            addedElement.measure = this;
        }

        return this;
    }
}

export const COLOR_STATE: string[][] =
{
    //untouched and unselected, touched and unselected
    {"#000000", "#444444"},
    //untouched and selected, touched and selected,
    {"#7FBFFF", "#7FCFFF"}
}
