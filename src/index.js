import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";



(function ()
{

    function startOSMD(event)
    {
        let file = event.target.files[0];
        if (file)
        {
            let canvas;
            let openSheetMusicDisplay;

            canvas = document.createElement("div");
            openSheetMusicDisplay = new OpenSheetMusicDisplay(canvas);
            openSheetMusicDisplay.setLogLevel("info");
            document.body.appendChild(canvas);

            file.text().then(text => {
                openSheetMusicDisplay.load(text);
                openSheetMusicDisplay.render();
            });
        }
    }

    function init()
    {
        const input = document.querySelector("#input");
        input.addEventListener("change", startOSMD);
    }

    window.addEventListener("load", function(){
        init();
    });

}());
