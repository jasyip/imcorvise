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
        this.zoom = zoom;
        this.canvas = document.createElement("div");
        this.canvas.id = "osmdCanvasPage" + this.graphicalMusicPage.PageNumber;
        // this.canvas.id = uniqueID // TODO create unique tagName like with cursor now?
        this.inner = this.canvas;
        this.inner.style.position = "relative";
        this.canvas.style.zIndex = "0";
        container.appendChild(this.inner);
        this.renderer = new ImcorviseRenderer(this.canvas, this.getVexflowBackendType());
        this.ctx = <Vex.Flow.SVGContext>this.renderer.getContext();
        this.ctx.svg.id = "osmdSvgPage" + this.graphicalMusicPage.PageNumber;
    }
}
