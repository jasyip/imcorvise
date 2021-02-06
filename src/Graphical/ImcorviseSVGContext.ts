import Vex from "vexflow";

export class ImcorviseSVGContext extends Vex.Flow.SVGContext
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

}
