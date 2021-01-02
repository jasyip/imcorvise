import { Imcorvise } from "./Imcorvise/Imcorvise";
import { ImcorviseGraphicalMusicSheet } from "./Graphical/ImcorviseGraphicalMusicSheet";
//import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

(function ()
{
    let imcorvise;
    let imcorviseDiv;
    let submitButton;
    let directions;

    function submit(event)
    {
        if (!imcorvise.GraphicSheet.SelectedMeasures
            || !imcorvise.GraphicSheet.SelectedMeasures.some(s => s.size > 0))
        {
            alert("Select some measures first!");
            return;
        }
        submit.disabled = true;
        directions.innerHTML =
            "Your file is being processed to cater your selection of measures."
        imcorvise.GraphicSheet.disableInteraction();
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
   
    function loadFile()
    {
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
        directions = document.getElementById("directions");
        directions.innerHTML = "Upload a MusicXML file to get started!"
        input.addEventListener("change", loadFile);
    }

    window.addEventListener("load", init); 

}());
