import { Load, Stage2 } from "./worker";

(function ()
{
    let worker;
    let imcorviseDiv;


    function onmessage(event)
    {
        switch (typeof event.data)
        {
            case InitialDone:
                document.body.appendChild(imcorviseDiv);
                break;
            case Done:
                document.getElementById("directions").innerHTML =
                    "Select all mostly-rest measures part of a solo."
                    + "<br>Hold down left-click and drag to select measures. "
                    + "Hold down right-click and drag to unselect measures.";
                const submitButton = document.getElementById("submit");
                submitButton.hidden = false;
                submitButton.addEventListener("click", worker.postMessage.bind(new Stage2()));
                break;
            case DOMModification:
                let element = document;
                for (let attribute in event.data.attributes)
                {
                    element = element[attribute];
                }
                element.add(event.data.value);
                break;
            case Ok:
                if (event.data.good)
                {
                    document.getElementById("submit").disabled = true;
                    document.getElementById("directions").innerHTML =
                        "Your file is being processed to cater your selection of measures."
                }
                else
                {
                    alert("Select some measures first!");
                }
                break;
            default:
                throw new Error();
        }
    }
   
    function loadFile()
    {
        document.getElementById("directions").innerHTML =
            "Your MusicXML file is being read at the moment. "
            + "Time needed to process is proportional to the file's size. ";
        let file = event.target.files[0];
        if (file)
        {
            worker.postMessage(file);
        }
    }

    function init()
    {
        const input = document.getElementById("input");
        input.addEventListener("change", loadFile);
        worker = new Worker("./worker.js");

        imcorviseDiv = document.createElement("div");
        worker.addEventListener("message", onmessage);
        worker.postMessage(new Load(imcorviseDiv));
    }

    window.addEventListener("load", init);

}());

export class InitialDone {}
export class Done {}
export class DOMModification
{
    constructor(attributes, value)
    {
        this.attributes = attributes;
        this.value = value;
    }
}
