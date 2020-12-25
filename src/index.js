import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import { ImcorviseMeasure } from "./graphical"

(function ()
{
    let osmd;
    let osmdDiv;

    function startOSMD(text)
    {
        osmd.load(text);
        osmd.render();
        let gs = osmd.GraphicSheet;
        let measureList = gs.MeasureList;
        let svgContainer = document.getElementById("osmdSvgPage1");
        measureList.forEach(function(measureCol, ind)
        {
            let measure = measureCol[0];
            let color = ind % 2 === 0 ? "red" : "blue";
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            let boundingBox = measure.staffEntries[0].PositionAndShape;
            boundingBox.calculateAbsolutePosition();
            let boundingRect = boundingBox.BoundingRectangle;
            
            rect.setAttributeNS(null, "x", boundingRect.x);
            rect.setAttributeNS(null, "y", boundingRect.y);
            rect.setAttributeNS(null, "height", boundingRect.height);
            rect.setAttributeNS(null, "width", boundingRect.width);
            rect.setAttributeNS(null, "fill", color);
            rect.setAttributeNS(null, "opacity", 0.4);
            
            if (ind === 0)
            {
                console.log(boundingRect);
            }
            svgContainer.appendChild(rect);
        });
    }
    
    function loadFile()
    {
        let file = event.target.files[0];
        if (file)
        {
            osmdDiv = document.createElement("div");
            osmd = new OpenSheetMusicDisplay(osmdDiv);
            osmd.setLogLevel("info");
            document.body.appendChild(osmdDiv);

            file.text().then(startOSMD);
        }
    }

    function init()
    {
        const input = document.querySelector("#input");
        input.addEventListener("change", loadFile);
    }

    window.addEventListener("load", function()
    {
        init();
    });

}());
