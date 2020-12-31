import { Imcorvise } from "./Imcorvise/Imcorvise";
import { ImcorviseGraphicalMusicSheet } from "./Graphical/ImcorviseGraphicalMusicSheet";
//import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";

(function ()
{
    let imcorvise;
    let imcorviseDiv;

    function submit(event)
    {
        if (!imcorvise.GraphicSheet.SelectedMeasures
            || !imcorvise.GraphicSheet.SelectedMeasures.some(s => s.size > 0))
        {
            alert("Select some measures first!");
            return;
        }
        imcorvise.GraphicSheet.disableInteraction();
    }

    function startImcorvise(text)
    {
        imcorvise.load(text);
        imcorvise.render();
        const submitButton = document.getElementById("submit");
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

            file.text().then(startImcorvise);
        }
    }

    function init()
    {
        const input = document.getElementById("input");
        input.addEventListener("change", loadFile);
    }

    window.addEventListener("load", function()
    {
        init();
    });

}());
