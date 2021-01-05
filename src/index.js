import { Imcorvise } from "./Imcorvise/Imcorvise";
import { ImcorviseGraphicalMusicSheet } from "./Graphical/ImcorviseGraphicalMusicSheet";
import { BackendType } from "opensheetmusicdisplay";
import { jsPDF } from "jspdf";
import "svg2pdf.js";

(function ()
{
    let imcorvise;
    let imcorviseDiv;
    let submitButton;
    let downloadButton;
    let directions;

    function writePDF(pdf, pdfName, backends, ind, options)
    {
        if (ind < backends.length)
        {
            if (ind > 0)
            {
                pdf.addPage();
            }
            pdf.svg(backends[ind].getSvgElement(), options).then(
                () => writePDF(pdf, pdfName, backends, ind + 1, options));
        }
        else
        {
            pdf.save(pdfName);
        }
    }

    //stolen from https://github.com/opensheetmusicdisplay/opensheetmusicdisplay/blob/develop/demo/index.js
    function download()
    {
        let pdfName = imcorvise.Sheet.FullNameString + ".pdf";
        const backends = imcorvise.Drawer.Backends;
        let svgElement = backends[0].getSvgElement();

        let pageWidth = 210;
        let pageHeight = 297;
        const engravingRulesPageFormat = imcorvise.EngravingRules.PageFormat;
        if (engravingRulesPageFormat && !engravingRulesPageFormat.IsUndefined)
        {
            pageWidth = engravingRulesPageFormat.width;
            pageHeight = engravingRulesPageFormat.height;
        }
        else
        {
            pageHeight = pageWidth * svgElement.clientHeight / svgElement.clientWidth;
        }
        console.log(pageWidth, pageHeight);
        const orientation = pageHeight > pageWidth ? "p" : "l";
        // create a new jsPDF instance
        const pdf = new jsPDF({
                orientation: orientation,
                unit: "mm",
                format: [pageWidth, pageHeight]
            });

        writePDF(pdf, pdfName, backends, 0, {
            width: pageWidth,
            height: pageHeight
        });
        // simply save the created pdf

        // note that using jspdf with svg2pdf creates unnecessary console warnings "AcroForm-Classes are not populated into global-namespace..."
        // this will hopefully be fixed with a new jspdf release, see https://github.com/yWorks/jsPDF/pull/32
    }

    function submit(event)
    {
        if (!imcorvise.GraphicSheet.SelectedMeasures
            || !imcorvise.GraphicSheet.SelectedMeasures.some(s => s.size > 0))
        {
            alert("Select some measures first!");
            return;
        }
        submitButton.disabled = true;
        directions.innerHTML =
            "Your file is being processed to cater your selection of measures."
        imcorvise.disableInteraction();
        imcorvise.modify();
        imcorviseDiv.innerHTML = "";
        imcorvise.updateGraphic();
        imcorvise.render()
        imcorvise.disableInteraction();
        directions.innerHTML = "Done!";
        downloadButton.hidden = false;
        downloadButton.addEventListener("click", download);
    }

    function startImcorvise(text)
    {
        imcorvise.load(text);
        imcorvise.render();
        directions.innerHTML =
            "Select all mostly-rest measures part of a solo."
            + "<br>Hold down left-click and drag to select measures. "
            + "Hold down right-click and drag to unselect measures.";
        submitButton.hidden = false;
        submitButton.addEventListener("click", submit);
    }
   
    function loadFile(event)
    {
        event.target.disabled = true;
        let file = event.target.files[0];
        if (file)
        {
            imcorviseDiv = document.createElement("div");
            imcorvise = new Imcorvise(imcorviseDiv);
            imcorvise.setLogLevel("info");
            document.body.appendChild(imcorviseDiv);
            directions.innerHTML = "Your MusicXML file is being read at the moment. "
                + "Time needed to process is proportional to the file's size. ";
            file.text().then(startImcorvise);
        }
    }

    function init()
    {
        const input = document.getElementById("input");
        submitButton = document.getElementById("submit");
        downloadButton = document.getElementById("download");
        directions = document.getElementById("directions");
        directions.innerHTML = "Upload a MusicXML file to get started!"
        input.addEventListener("change", loadFile);
    }

    window.addEventListener("load", init); 

}());
