import Vex from "vexflow";

export class ImcorviseMeasure extends Vex.Flow.Stave
{

    private function onmousedown(): void
    {
        
    }

    private function onmouseup(): void
    {

    }

    private function onmouseenter(): void
    {

    }

    private function onmouseleave(): void
    {

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
            box_fill_style: "#000000";
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

    public draw(ctx: Vex.IRenderContext): void
    {
        
        super.draw();
    }
}

export const COLOR_STATE: string[][] =
{
    //untouched and unselected, touched and unselected
    {"#000000", "#444444"},
    //untouched and selected, touched and selected,
    {"#7FBFFF", "#7FCFFF"}
}
