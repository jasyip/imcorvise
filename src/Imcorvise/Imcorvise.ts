import
{
    OpenSheetMusicDisplay,
    MusicSheetCalculator,
    IXmlElement,
    GraphicalMusicSheet,
    MXLHelper,
    BackendType,
    GraphicalMusicPage,
    VexFlowBackend,
    CanvasVexFlowBackend
}
    from "osmd";

import log from "loglevel";

import { ImcorviseMusicSheetCalculator } from "../Graphical/ImcorviseMusicSheetCalculator";
import { ImcorviseMusicSheetReader } from "../MusicalScore/ImcorviseMusicSheetReader";
import { ImcorviseGraphicalMusicSheet } from "../Graphical/ImcorviseGraphicalMusicSheet";
import { ImcorviseSVGBackend } from "../Graphical/ImcorviseSVGBackend";

export class Imcorvise extends OpenSheetMusicDisplay
{
    public updateGraphic(): void
    {
        const calc: MusicSheetCalculator = new ImcorviseMusicSheetCalculator(this.rules);
        this.graphic = new ImcorviseGraphicalMusicSheet(this.sheet, calc);
        if (this.drawingParameters.drawCursors && this.cursor)
        {
            this.cursor.init(this.sheet.MusicPartManager, this.graphic);
        }
    }

    public load(content: string | Document): Promise<{}>
    {
        // Warning! This function is asynchronous! No error handling is done here.
        this.reset();
        //console.log("typeof content: " + typeof content);
        if (typeof content === "string")
        {
            const str: string = <string>content;
            const self: OpenSheetMusicDisplay = this;
            // console.log("substring: " + str.substr(0, 5));
            if (str.substr(0, 4) === "\x50\x4b\x03\x04")
            {
                log.debug("[OSMD] This is a zip file, unpack it first: " + str);
                // This is a zip file, unpack it first
                return MXLHelper.MXLtoXMLstring(str).then(
                    (x: string) => {
                        return self.load(x);
                    },
                    (err: any) => {
                        log.debug(err);
                        throw new Error("OpenSheetMusicDisplay: Invalid MXL file");
                    }
                );
            }
            // Javascript loads strings as utf-16,
            // which is wonderful BS if you want to parse UTF-8 :S
            if (str.substr(0, 3) === "\uf7ef\uf7bb\uf7bf")
            {
                log.debug("[OSMD] UTF with BOM detected"
                    + ", truncate first three bytes and pass along: " + str);
                // UTF with BOM detected, truncate first three bytes and pass along
                return self.load(str.substr(3));
            }
            let trimmedStr: string = str;
            if (/^\s/.test(trimmedStr)) // only trim if we need to. (end of string is irrelevant)
            {
                trimmedStr = trimmedStr.trim(); // trim away empty lines at beginning etc
            }
            if (trimmedStr.substr(0, 6).includes("<?xml")) // first character is sometimes null,
            //making first five characters '<?xm'.
            {
                log.debug("[OSMD] Finally parsing XML content, length: " + trimmedStr.length);
                // Parse the string representing an xml file
                const parser: DOMParser = new DOMParser();
                content = parser.parseFromString(trimmedStr, "application/xml");
            }
            else if (trimmedStr.length < 2083) // TODO do proper URL format check
            {
                log.debug("[OSMD] Retrieve the file at the given URL: " + trimmedStr);
                // Assume now "str" is a URL
                // Retrieve the file at the given URL
                return AJAX.ajax(trimmedStr, this.loadUrlTimeout).then(
                    (s: string) => { return self.load(s); },
                    (exc: Error) => { throw exc; }
                );
            }
            else
            {
                console.error("[OSMD] osmd.load(string):"
                    + " Could not process string. Did not find <?xml at beginning.");
            }
        }

        if (!content || !(<any>content).nodeName)
        {
            return Promise.reject(new Error("OpenSheetMusicDisplay:"
                + " The document which was provided is invalid"));
        }
        const xmlDocument: Document = (<Document>content);
        const xmlDocumentNodes: NodeList = xmlDocument.childNodes;
        log.debug("[OSMD] load(), Document url: " + xmlDocument.URL);

        let scorePartwiseElement: Element;
        for (let i: number = 0, length: number = xmlDocumentNodes.length; i < length; i += 1)
        {
            const node: Node = xmlDocumentNodes[i];
            if (node.nodeType === Node.ELEMENT_NODE
                && node.nodeName.toLowerCase() === "score-partwise")
            {
                scorePartwiseElement = <Element>node;
                break;
            }
        }
        if (!scorePartwiseElement)
        {
            console.error("Could not parse MusicXML, no valid partwise element found");
            return Promise.reject(new Error("OpenSheetMusicDisplay:"
                + " Document is not a valid 'partwise' MusicXML"));
        }
        const score: IXmlElement = new IXmlElement(scorePartwiseElement);
        const reader: MusicSheetReader = new ImcorviseMusicSheetReader(undefined, this.rules);
        this.sheet = reader.createMusicSheet(score, "Untitled Score");
        if (this.sheet === undefined)
        {
            // error loading sheet, probably already logged, do nothing
            return Promise.reject(new Error(
                "given music sheet was incomplete or could not be loaded."));
        }
        log.info(`[OSMD] Loaded sheet ${this.sheet.TitleString} successfully.`);

        this.needBackendUpdate = true;
        this.updateGraphic();

        return Promise.resolve({});
    }

    public render(): void
    {
        super.render();

        const graphic: ImcorviseGraphicalMusicSheet =
            this.GraphicSheet as ImcorviseGraphicalMusicSheet;

        //this.container.style["pointer-events"] = "none";
        this.container.style["-webkit-touch-callout"] = "none";
        this.container.style["-webkit-user-select"] = "none";
        this.container.style["-khtml-user-select"] = "none";
        this.container.style["-moz-user-select"] = "none";
        this.container.style["-ms-user-select"] = "none";
        this.container.style["user-select"] = "none";
        this.container.addEventListener("click", e => e.preventDefault());
        this.container.addEventListener("contextmenu", e => e.preventDefault());
        this.container.addEventListener("dblclick", e => e.preventDefault());
        this.container.addEventListener("mousedown", e => e.preventDefault());
        this.container.addEventListener("mouseenter", e => e.preventDefault());
        this.container.addEventListener("mouseleave", e => e.preventDefault());
        this.container.addEventListener("mouseout", e => e.preventDefault());
        this.container.addEventListener("mouseover", e => e.preventDefault());
        this.container.addEventListener("mouseup", function (e)
        {
            e.preventDefault();
            graphic.forceUpdate();
        });
    }

    public createBackend(type: BackendType, page: GraphicalMusicPage): VexFlowBackend
    {
        
        let backend: VexFlowBackend;
        if (type === undefined || type === BackendType.SVG)
        {
            backend = new ImcorviseSVGBackend(this.rules);
        }
        else
        {
            backend = new CanvasVexFlowBackend(this.rules);
        }
        // the page the backend renders on. needed to identify DOM element to extract image/SVG
        backend.graphicalMusicPage = page; 
        backend.initialize(this.container, this.zoom);
        return backend;

    }

    public disableInteraction(): void
    {
        (this.GraphicSheet as ImcorviseGraphicalMusicSheet).disableInteraction();
    }

    public modify(): void
    {
        (this.Sheet as ImcorviseMusicSheet).modify(
            (this.GraphicSheet as ImcorviseGraphicalMusicSheet).SelectedMeasures);
    }

}
