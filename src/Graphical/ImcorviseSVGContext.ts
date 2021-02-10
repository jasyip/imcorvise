import Vex from "vexflow";

import { SVGContext } from "vexflow/src/svgcontext";

export class ImcorviseSVGContext extends SVGContext
{ 
    public openGroup(cls: string, id: string, attrs) : HTMLElement
    {
        const group = this.create('g');
        this.groups.push(group);
        this.parent.appendChild(group);
        this.parent = group;
        if (cls) 
        {
            group.setAttribute('class', Vex.Prefix(cls));   
        }
        if (id)
        {
            group.setAttribute('id', Vex.Prefix(id));
        }
        return group;
    }

    public create(svgElementType: string): SVGSVGElement
    {
        let element = document.createElementNS(this.svgNS, svgElementType);
        element.setAttribute("pointer-events", "none");
        return element;
    }

}
