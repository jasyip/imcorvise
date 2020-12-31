import Vex from "vexflow";


export class ImcorviseSVGContext extends Vex.Flow.SVGContext
{
    public rect
    (
        x: number,
        y: number,
        width: number,
        height: number,
        attributes: object,
        events: object
    )
    : ImcorviseSVGContext
    {
        // Avoid invalid negative height attribs by
        // flipping the rectangle on its head:
        if (height < 0)
        {
            y += height;
            height *= -1;
        }

        // create the rect & style it:
        const rectangle: SVGSVGElement = this.create('rect');
        if (typeof attributes === 'undefined')
        {
            attributes = {
                fill: 'none',
                'stroke-width': this.lineWidth,
                stroke: 'black',
            };
        }

        Vex.Merge(attributes, {
            x,
            y,
            width,
            height,
        });

        this.applyAttributes(rectangle, attributes);
        this.applyEvents(rectangle, events);
        this.add(rectangle);
        return this;
    }

    private applyEvents(element: SVGSVGElement, events: object): SVGSVGElement
    { 
        Object.keys(events).forEach(eventName => {
            element.addEventListener(eventName, events[eventName]);
        });
        return element;
    }

}
