import
{
    SvgVexFlowBackend
}
    from "osmd";

import Vex from "vexflow";

import { ImcorviseRenderer } from "./ImcorviseRenderer";

export class ImcorviseSVGBackend extends SvgVexFlowBackend
{
    public initialize(container: HTMLElement, zoom: number): void
    {
        super.initialize(container, zoom);
        this.renderer = new ImcorviseRenderer(this.canvas, this.getVexflowBackendType());
        this.ctx = <Vex.Flow.SVGContext>this.renderer.getContext();
        this.ctx.svg.id = "osmdSvgPage" + this.graphicalMusicPage.PageNumber;
    }
}
