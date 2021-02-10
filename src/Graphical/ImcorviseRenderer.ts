import Vex from "vexflow";

import { ImcorviseSVGContext } from "./ImcorviseSVGContext";

export class ImcorviseRenderer extends Vex.Flow.Renderer
{
    constructor(elementId: string, backend: number)
    {
        super(elementId, backend);
        if (this.backend === Vex.Flow.Renderer.Backends.SVG)
        {
            this.ctx = new ImcorviseSVGContext(this.element);
        }
    }
    
    public static buildContext
    (
        elementId: string,
        backend: number,
        width: number,
        height: number,
        background: number
    )
    : object
    {
        const renderer = new ImcorviseRenderer(elementId, backend);
        if (width && height)
        {
            renderer.resize(width, height);
        }

        if (!background)
        {
            background = '#FFF';
        }
        const ctx = renderer.getContext();
        ctx.setBackgroundFillStyle(background);
        Vex.Flow.Renderer.lastContext = ctx;
        return ctx;
    }
}
