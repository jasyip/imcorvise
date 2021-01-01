import { Imcorvise } from "./Imcorvise/Imcorvise";
import { ImcorviseGraphicalMusicSheet } from "./Graphical/ImcorviseGraphicalMusicSheet";

import { InitialDone, Done, DOMModification, Ok } from "./index";

onmessage = function (event)
{
    switch (typeof event.data)
    {
        case Load:
            self.imcorvise = new Imcorvise(event.data.element);
            self.imcorvise.setLogLevel("info");
            postMessage(new InitialDone());
            break;
        case File:
            console.log(event.data.substring(0, 20));
            event.data.text().then(text => {
                imcorvise.load(text);
                imcorvise.render();
                postMessage(new Done());
            });
            break;
        case Stage2:
            const ok = (self.imcorvise.GraphicSheet.SelectedMeasures
                 && self.imcorvise.GraphicSheet.SelectedMeasures.some(s => s.size > 0));
            if (ok)
            {
                self.imcorvise.GraphicSheet.disableInteraction();
            }
            postMessage(new Ok(ok));
            break;
        
    }
}

export class Load
{
    constructor(element)
    {
        this.element = element;
    }
}
export class Stage2 {}
