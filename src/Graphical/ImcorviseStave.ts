import Vex from "vexflow";

export class ImcorviseStave extends Vex.Flow.Stave
{

    private onmousedown(): void
    {
        console.log(this.measure + " DOWN");
    }

    private onmouseup(): void
    {

        console.log(this.measure + " UP");
    }

    private onmouseenter(): void
    {
        console.log(this.measure + " ENTER");

    }

    private onmouseleave(): void
    {
        console.log(this.measure + " LEAVE");
    }

    constructor
    (
        x: number,
        y: number,
        width: number,
        options: object,
    )
    {
        super(x, y, width, options);
        Vex.Merge(this.options, {
            box_stroke: "none";
            onmousedown: onmousedown,
            onmouseup: onmouseup, 
            onmouseenter: onmouseenter, 
            onmouseleave: onmouseleave
        });
    }

    public resetLines(): void
    {
        super.resetLines();
    }

    public draw(): void
    {    
        super.draw();
        this.context.save();
        this.context.rect(this.x, this.getTopLineTopY(), this.width, this.getHeight(), {
            stroke: this.options.box_stroke,
            onmousedown: this.options.onmousedown,
            onmouseup: this.options.onmouseup,
            onmouseenter: this.options.onmouseenter,
            onmouseleave: this.options.onmouseleave
        });
        this.context.restore();
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
