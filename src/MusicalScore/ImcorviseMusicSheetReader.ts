import
{
    MusicSheetReader,
    IXmlElement,
    InstrumentReader,
    MusicSheet,
    MusicSheetReadingException,
    SourceMeasure,
    ITextTranslation,
    IAfterSheetReadingModule,
    Fraction
}
    from "osmd";

import log from "loglevel";

import { ImcorviseMusicSheet } from "./ImcorviseMusicSheet";

export class ImcorviseMusicSheetReader extends MusicSheetReader
{
    public createMusicSheet(root: IXmlElement, path: string): MusicSheet
    {
        try
        {
            const instrumentReaders: InstrumentReader[] = [];
            let sourceMeasureCounter: number = 0;
            this.musicSheet = new ImcorviseMusicSheet();
            this.musicSheet.Path = path;
            this.musicSheet.Rules = this.rules;
            if (!root)
            {
                throw new MusicSheetReadingException("Undefined root element");
            }
            this.pushSheetLabels(root, path);
            const partlistNode: IXmlElement = root.element("part-list");
            if (!partlistNode)
            {
                throw new MusicSheetReadingException("Undefined partListNode");
            }

            const partInst: IXmlElement[] = root.elements("part");
            const partList: IXmlElement[] = partlistNode.elements();
            this.initializeReading(partList, partInst, instrumentReaders);
            let couldReadMeasure: boolean = true;
            this.currentFraction = new Fraction(0, 1);
            let guitarPro: boolean = false;
            let encoding: IXmlElement = root.element("identification");
            if (encoding)
            {
                encoding = encoding.element("encoding");
            }
            if (encoding)
            {
                encoding = encoding.element("software");
            }
            if (encoding !== undefined && encoding.value === "Guitar Pro 5")
            {
                guitarPro = true;
            }

            while (couldReadMeasure)
            {
                // TODO changing this.rules.PartAndSystemAfterFinalBarline requires
                // a reload of the piece for measure numbers to be updated
                if (this.currentMeasure !== undefined
                    && this.currentMeasure.HasEndLine
                    && this.rules.NewPartAndSystemAfterFinalBarline)
                {
                    sourceMeasureCounter = 0;
                }
                this.currentMeasure = new SourceMeasure(
                    this.completeNumberOfStaves, this.musicSheet.Rules);
                for (const instrumentReader of instrumentReaders)
                {
                    try
                    {
                        couldReadMeasure = couldReadMeasure && instrumentReader.readNextXmlMeasure(
                            this.currentMeasure, this.currentFraction, guitarPro);
                    }
                    catch (e)
                    {
                        const errorMsg: string = ITextTranslation.translateText(
                            "ReaderErrorMessages/InstrumentError",
                            "Error while reading instruments.");
                        throw new MusicSheetReadingException(errorMsg, e);
                    }

                }
                if (couldReadMeasure)
                {
                    this.musicSheet.addMeasure(this.currentMeasure);
                    this.checkIfRhythmInstructionsAreSetAndEqual(instrumentReaders);
                    this.checkSourceMeasureForNullEntries();
                    sourceMeasureCounter = this.setSourceMeasureDuration(
                        instrumentReaders, sourceMeasureCounter);
                    MusicSheetReader.doCalculationsAfterDurationHasBeenSet(instrumentReaders);
                    this.currentMeasure.AbsoluteTimestamp = this.currentFraction.clone();
                    this.musicSheet.SheetErrors.finalizeMeasure(this.currentMeasure.MeasureNumber);
                    this.currentFraction.Add(this.currentMeasure.Duration);
                    this.previousMeasure = this.currentMeasure;
                }
            }

            if (this.repetitionInstructionReader)
            {
                this.repetitionInstructionReader.removeRedundantInstructions();
                if (this.repetitionCalculator)
                {
                    this.repetitionCalculator.calculateRepetitions(
                        this.musicSheet, this.repetitionInstructionReader.repetitionInstructions);
                }
            }
            this.musicSheet.checkForInstrumentWithNoVoice();
            this.musicSheet.fillStaffList();
            //this.musicSheet.DefaultStartTempoInBpm =
            //    this.musicSheet.SheetPlaybackSetting.BeatsPerMinute;
            for (let idx: number = 0, len: number = this.afterSheetReadingModules.length;
                idx < len; ++idx)
            {
                const afterSheetReadingModule: IAfterSheetReadingModule = 
                    this.afterSheetReadingModules[idx];
                afterSheetReadingModule.calculate(this.musicSheet);
            }

            //this.musicSheet.DefaultStartTempoInBpm =
            //    this.musicSheet.SourceMeasures[0].TempoInBPM;
            this.musicSheet.userStartTempoInBPM = this.musicSheet.userStartTempoInBPM
                || this.musicSheet.DefaultStartTempoInBpm;

            return this.musicSheet; 
        }
        catch (e)
        {
            log.error("ImcorviseMusicSheetReader.CreateMusicSheet", e);
            return undefined;
        }
    }
}
