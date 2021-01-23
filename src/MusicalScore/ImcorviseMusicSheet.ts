import
{
    MusicSheet,
    SourceMeasure,
    Fraction,
    Staff,
    Voice,
    VoiceEntry,
    Note,
    Pitch,
    Fraction,
    SourceStaffEntry,
    VerticalSourceStaffEntryContainer
}
    from "osmd";

import { KrumhanslSchmuckler } from "./KrumhanslSchmuckler";
import { ChordToNotes } from "./ChordToNotes";

export class ImcorviseMusicSheet extends MusicSheet
{

    constructor()
    {
        super();
        //k: source measure, v: array of staveInds
        this.selectedMeasures = new Map();
        //k: source measure, v: set of chordsymbolcontainers
        this.chords = new Map();
        //k: source measure, v: array of number arrays of len 12
        this.specificLengths = new Map();
        //totalLengths.forEach(item => item = new Array(12).fill(0.0));
        //k: source measure, v: array of sets of numbers
        this.uniquePitches = new Map();
    }

    private selectedMeasures: Map;
    private chords: Map;
    private specificLengths: Map;
    private totalLengths: number[][];
    private uniquePitches: Map;
    private staves: Staff[];

    private static generateNote
    (
        chord: ChordSymbolContainer,
        staff: Staff,
        measure: SourceMeasure,
        timestamp: Fraction,
        duration: Fraction,
        pitch: Pitch,
        isRest: boolean,
    )
    : void 
    {
        let addChord: boolean = measure.VerticalSourceStaffEntryContainers.length === 0;
        const staffEntry = measure.findOrCreateStaffEntry(timestamp, 0, staff).staffEntry;
        const voiceEntry = measure.findOrCreateVoiceEntry(staffEntry, staff.Voices[0]).voiceEntry;
        const note = new Note(voiceEntry, staffEntry, duration, pitch, measure, isRest);
        voiceEntry.Notes.push(note);
        if (addChord)
        {
            staffEntry.ChordContainers = [chord];
        }
    }


    private static getMaximumDuration(voiceEntry: VoiceEntry): Fraction
    {
        let out: Fraction = new Fraction();
        for (let note: Note of voiceEntry.Notes)
        {
            if (note.Duration && note.Duration.gt(out))
            {
                out = note.Duration;
            }
        }
        return out;
    }

    private static addRest
    (
        chord: ChordSymbolContainer,
        staff: Staff,
        out: Note[],
        measure: SourceMeasure,
        curPos: Fraction,
        curRestDur: Fraction
    )
    : void
    {
        let added: number = 0;
        for (let i = 8; i >= 1; i >>= 1)
        {
            if (curPos.Denominator === i && curRestDur.Numerator > 0 && curRestDur.Denominator === i)
            {
                out.push(ImcorviseMusicSheet.generateNote(chord, staff, measure, curPos.clone(),
                    new Fraction(1, i), undefined, true))
                added |= i;
                curPos.Add(new Fraction(1, i));
                curRestDur.Sub(new Fraction(1, i));
            }
        }
        for (let i = 1; i <= 8; i <<= 1)
        {
            if (!(added & i) && curRestDur.gte(new Fraction(1, i)))
            {
                out.push(ImcorviseMusicSheet.generateNote(chord, staff, measure, curPos.clone(),
                    new Fraction(1, i), undefined, true));
                curPos.Add(new Fraction(1, i));
                curRestDur.Sub(new Fraction(1, i));
            }
        }
    }

    private modifyMeasure
    (
        staff: Staff,
        measure: SourceMeasure,
        chord: ChordSymbolContainer,
        preferSharps: boolean = true,
    )
    : void
    {
        //console.log(measure.MeasureNumber, measure.VerticalSourceStaffEntryContainers);
        measure.VerticalSourceStaffEntryContainers.splice(0,
            measure.VerticalSourceStaffEntryContainers.length);

        const chordInts: number[] = ChordToNotes.getInts(chord);
        const majorInts: number[] = [0, 2, 4, 5, 7, 9, 11];
        const scaleInts: number[] = chordInts[2] === 3 ? [0, 2, 3, 5, 7, 8, 10] : majorInts;
        let finalInts: number[] = new Array(scaleInts.length);
        for (let i = 0; i < scaleInts.length; ++i)
        {
            finalInts[i] = (chord.RootPitch.getHalfTone() + (chordInts[i] || scaleInts[i])) % 12;
        }
        finalInts.sort((a, b) => a - b);
        let accidentals: number[];
        let mostFrequent: number = preferSharps ? 1 : -1;
        for (let i = 0; i < 2; ++i)
        {
            let accidentalsCopy: number[] = new Array(scaleInts.length).fill(0);
            
            for (let j = 0; j < scaleInts.length; ++j)
            {
                accidentalsCopy[j] = finalInts[j] - majorInts[j];
                if (Math.abs(accidentalsCopy[j]) >= 12 / 2)
                {
                    accidentalsCopy[j] = accidentalsCopy[j] - Math.sign(accidentalsCopy[j]) * 12;
                }
            }
            if (!accidentalsCopy.some(i => Math.abs(i) > 1) && (!accidentals
                || accidents.count(0) < accidentalsCopy.count(0)
                || accidentals.count(0) === accidentalsCopy.count(0)
                && accidentals.filter(i => i === mostFrequent).length
                < accidentalsCopy.filter(i => i === mostFrequent).length))
            {
                accidentals = accidentalsCopy;
            }
            if (preferSharps)
            {
                finalInts.push(finalInts.shift());
            }
            else
            {
                finalInts.unshift(finalInts.pop());
            }
        }

        let out: Note[] = new Array(0)
        let curRestDur: Fraction = new Fraction();
        let curPos: Fraction = new Fraction();
        for (let i = 0; i < scaleInts.length; ++i)
        {
            if (accidentals[i])
            {
                ImcorviseMusicSheet.addRest(chord, staff, out, measure, curPos, curRestDur);
                out.push(ImcorviseMusicSheet.generateNote(chord, staff, measure,
                    curPos.clone(), new Fraction(1, 8),
                    new Pitch(majorInts[i], i < 3 ? 2 : 1,
                    Pitch.AccidentalFromHalfTones(accidentals[i])), false));
                curPos.Add(new Fraction(1, 8));
            }
            else
            {
                curRestDur.Add(new Fraction(1, 8));
            }
        }
        curRestDur.Add(new Fraction(1, 8));
        ImcorviseMusicSheet.addRest(chord, staff, out, measure, curPos, curRestDur);
    }

    public getChords(measure: SourceMeasure): ChordSymbolContainer[]
    {
        let previousMeasure = measure;
        while (previousMeasure)
        {
            for (let [entryMeasure, entrySet] of this.chords.entries())
            {
                if (entryMeasure === previousMeasure && entrySet.size)
                {
                    return Array.from(entrySet);
                }
            }
            previousMeasure = this.SourceMeasures[measure.MeasureNumber - 2];
        }
        return new Array(0);
    }

    public modify(measureInds: number[][]): boolean
    {
        this.totalLengths = new Array(measureInds.length);
        for (let i = this.totalLengths.length; i--; )
        {
            this.totalLengths[i] = new Array(12).fill(0.0);
        }

        for (let staveInd: number = 0; staveInd < measureInds.length; ++staveInd)
        {
            for (let ind: number of measureInds[staveInd])
            {
                const measure = this.SourceMeasures[ind - 1];
                if (!this.selectedMeasures.has(measure))
                {
                    this.selectedMeasures.set(measure, [staveInd]);
                }
                else
                {
                    this.selectedMeasures.get(measure).push(staveInd);
                }
            }
        }

        this.staves = new Array(0);
        for (let part: Instrument of this.Parts)
        {
            part.Staves.forEach(stave => this.staves.push(stave));
        }

        for (let staveInd: number = 0; staveInd < this.staves.length; ++staveInd)
        {
            for (let voice: Voice of this.staves[staveInd].Voices)
            {
                let indsToDel: Set = new Set();
                let VEInd: number = 0;
                for (let voiceEntry: VoiceEntry of voice.VoiceEntries)
                {
                    for (let note: Note of voiceEntry.Notes)
                    {
                        //collecting measure's chords
                        if (!this.chords.has(note.SourceMeasure))
                        {
                            this.chords.set(note.SourceMeasure, new Set(
                                voiceEntry.ParentSourceStaffEntry.ChordContainers));
                        }
                        else
                        {
                            voiceEntry.ParentSourceStaffEntry.ChordContainers.
                                forEach(chord => this.chords.get(note.SourceMeasure).add(chord));
                        }

                        if (!note.isRest())
                        {
                            const length: number = note.Length.RealValue;
                            const pitch: Pitch = note.Pitch;
                            const pitchAsInt: number = (pitch.fundamentalNote
                                + Pitch.HalfTonesFromAccidental(pitch.Accidental) + 12) % 12;
                            this.totalLengths[staveInd][pitchAsInt] += length;

                            //if note is legit
                            if (this.selectedMeasures.get(note.SourceMeasure) &&
                                this.selectedMeasures.get(note.SourceMeasure).includes(staveInd))
                            {
                                indsToDel.add(VEInd);
                                if (!this.specificLengths.has(note.SourceMeasure))
                                {
                                    const arr = new Array(this.staves.length);
                                    for (let i = arr.length; i--; )
                                    {
                                        arr[i] = new Array(12).fill(0);
                                    }
                                    this.specificLengths.set(note.SourceMeasure, arr);
                                }
                                this.specificLengths.get(note.SourceMeasure)[staveInd][pitchAsInt]
                                    += length;

                                if (!this.uniquePitches.has(note.SourceMeasure))
                                {
                                    this.uniquePitches.set(note.SourceMeasure,
                                        new Array(this.staves.length));
                                }
                                if (!this.uniquePitches.get(note.SourceMeasure)[staveInd])
                                {
                                    this.uniquePitches.get(note.SourceMeasure)[staveInd] =
                                        new Set([pitchAsInt]);
                                }
                                else
                                {
                                    this.uniquePitches.get(note.SourceMeasure)[staveInd].add(
                                        pitchAsInt);
                                }
                            }
                        }
                    }
                    ++VEInd;
                }
/*
                indsToDel = Array.from(indsToDel).sort((a, b) => b - a);
                for (const ind: number of indsToDel)
                {
                    voice.VoiceEntries.splice(ind, 1);
                }
*/
            }
        }
        let chordsOfSheet: ChordSymbolContainer[] = new Array(this.staves.length);
        for (let tempInd = 0; tempInd < this.staves.length; ++tempInd)
        {
            chordsOfSheet[tempInd] = KrumhanslSchmuckler.getChord(this.totalLengths[tempInd]);
        }
        for (let [measure, inds] of this.selectedMeasures.entries())
        {
            const measureChords: ChordSymbolContainer[] = this.getChords(measure);
                // need to guess using krumahsnl-schmuckler on
                // measure's notes if it has 2+ notes or entire piece
            for (let staveInd: number of inds)
            {
                if (measureChords.length === 0)
                {
                    let chord: ChordSymbolContainer;
                    if (this.uniquePitches.get(measure)
                        && this.uniquePitches.get(measure)[staveInd].size >= 2)
                    {
                        chord = KrumhanslSchmuckler.getChord(
                            this.specificLengths.get(measure)[staveInd]);
                    }
                    else
                    {
                        chord = chordsOfSheet[staveInd];
                    }
                    this.modifyMeasure(this.staves[staveInd], measure, chord);
                }
                else
                {
                    this.modifyMeasure(
                        this.staves[staveInd], measure, measureChords[0]);
                }
            }
        }
    }

}
