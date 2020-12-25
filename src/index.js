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
        //typeof measure => GraphicalMeasure
        measureList.forEach(function(measureCol, ind)
        {
            let measure = measureCol[0];
            let color = ind % 2 === 0 ? "red" : "blue";
          console.log(measure);
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            let boundingBox = measure.boundingBox;
            console.log(boundingBox);

            let scale = 10.0;
            rect.setAttributeNS(null, "x", boundingBox.absolutePosition.x * scale);
            rect.setAttributeNS(null, "y", boundingBox.absolutePosition.y * scale);
            rect.setAttributeNS(null, "height", boundingBox.size.height * scale);
            rect.setAttributeNS(null, "width", boundingBox.size.width * scale);
            rect.setAttributeNS(null, "fill", color);
            rect.setAttributeNS(null, "opacity", 0.4);

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
