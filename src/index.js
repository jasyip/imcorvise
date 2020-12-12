(function ()
    {
        var canvas;
        var openSheetMusicDisplay;

        function init()
        {
            canvas = document.createElement("div");
            openSheetMusicDisplay = new OpenSheetMusicDisplay(canvas);
            openSheetMusicDisplay.setLogLevel("info");
            document.body.appendChild(canvas);
        }

    }());
