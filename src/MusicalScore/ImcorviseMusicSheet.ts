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
    SourceStaffEntry
}
    from "opensheetmusicdisplay";

import { KrumhanslSchmuckler } from "./KrumhanslSchmuckler";
import { ChordToNotes } from "./ChordToNotes";

export class ImcorviseMusicSheet extends MusicSheet
{

    private static generateNote
    (
        parentVoice: Voice,
        measure: SourceMeasure,
        timestamp: Fraction,
        duration: Fraction,
        pitch: Pitch,
        isRest: boolean = false,
    )
    : void
    {
        let staffEntry = measure.findOrCreateStaffEntry(
            timestamp, undefined, parentVoice.Parent).staffEntry
        let voiceEntry = new VoiceEntry(timestamp, parentVoice, staffEntry);
        let note = new Note(voiceEntry, staffEntry, duration, pitch, measure, isRest);
        voiceEntry.Notes.push(note);
        staffEntry.VoiceEntries.push(voiceEntry);
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

    private static modifyMeasure
    (
        staff: Staff,
        measure: SourceMeasure,
        chord: ChordSymbolContainer,
        useSharps: boolean = false,
    )
    : void
    {
        let durationLeft: [Fraction, Fraction] =
            [measure.AbsoluteTimestamp,
            Fraction.plus(measure.AbsoluteTimestamp, measure.Duration)];

        const voice: Voice = staff.Voices[0];
        const voiceEntries: VoiceEntry[] = voice.VoiceEntries;

        let startInd;
        for (startInd = 0; startInd < voiceEntries.length
            && durationLeft[0].gte(new Fraction()); ++startInd)
        {
            durationLeft[0].Sub(ImcorviseMusicSheet.getMaximumDuration(voiceEntries[startInd]));
        }
        let endInd;
        for (let endInd = 0; endInd < voiceEntries.length
            && durationLeft[1].gte(new Fraction()); ++endInd)
        {
            durationLeft[1].Sub(ImcorviseMusicSheet.getMaximumDuration(voiceEntries[endInd]));
        }
        //purge from verticalsourcestaffentries
        for (let voiceEntry : voiceEntries.slice(startInd, endInd))
        {
            const parent: SourceStaffEntry = voiceEntry.ParentSourceStaffEntry; 
            const vcp = parent.VerticalContainerParent;
            vcp.splice(vcp.indexOf(parent), 1);
        }
        //purge from voice
        voiceEntries.splice(startInd, endInd - startInd);

        const chordInts: number[] = ChordToNotes.getInts(chord);
        const scaleInts: number[] = [0, 2, 4, 5, 7, 9, 11];
        let finalInts: number[] = new Array(scaleInts.length);
        for (let i = 0; i < chordInts.length; ++i)
        {
            finalInts[i] = (chord.RootPitch.getHalfTone() + (chordInts[i] || scaleInts[i])) % 12;
        }
        let accidentals: number[] = new Array(scaleInts.length).fill(0);
        if (useSharps)
        {
            for (let i = scaleInts.length; i--; )
            {
                if (!scaleInts.includes(finalInts[i]) || accidentals[(i + 1) % scaleInts.length])
                {
                    accidentals[i] = 1;
                }
            }
        }
        else
        {
            for (let i = 0; i < scaleInts.length; ++i)
            {
                if (!scaleInts.includes(finalInts[i]) ||
                    accidentals[(i - 1 + scaleInts.length) % scaleInts.length])
                {
                    accidentals[i] = -1;
                }
            }
        }

        let out = new Array(0)
        let curRestDur: Fraction = new Fraction();
        for (let i = 0; i < scaleInts.length; ++i)
        {
            if (accidentals[i])
            {
                if (curRestDur.gt(new Fraction()))
                {
                    for (let j = 1; j <= 3; ++j)
                    {
                        if (curRestDur.gte(new Fraction(1, 1 << j)))
                        {
                            out.push(ImcorviseMusicSheet.generateNote(voice, measure,
                                Fraction.minus(new Fraction(i, 8),
                                new Fraction(1, 1 << j)), curRestDur, undefined, true));
                            curRestDur.Sub(new Fraction(1, 2));
                        }
                    }
                }
                out.push(ImcorviseMusicSheet.generateNote(voice, measure,
                    new Fraction(i, 8), new Fraction(1, 8),
                    new Pitch(finalInts[i] - accidentals[i], 4,
                    Pitch.AccidentalFromHalfTones(accidentals[i])), true));
                curRestDur = new Fraction();
            }
            else
            {
                curRestDur.Add(new Fraction(1, 8));
            }
        }
    }

    public static getChords
    (
        chords: Map, 
        measure: SourceMeasure,
        measures: SourceMeasure[]
    )
    : ChordSymbolContainer[]
    {
        let previousMeasure = measure;
        while (previousMeasure)
        {
            for (let [entryMeasure, entrySet] of chords.entries())
            {
                if (entryMeasure === previousMeasure && entrySet.size)
                {
                    return Array.from(entrySet);
                }
            }
            previousMeasure = measures[measure.MeasureNumber - 2];
        }
        return new Array(0);
    }

    public modify(measureInds: number[][]): boolean
    {
        //k: source measure, v: array of staveInds
        let measures: Map = new Map();
        //k: source measure, v: set of chordsymbolcontainers
        let chords: Map = new Map();
        //k: source measure, v: array of number arrays of len 12
        let specificLengths: Map = new Map();
        let totalLengths: number[][] = new Array(measureInds.length);
        for (let i = totalLengths.length; i--; ) { totalLengths[i] = new Array(12).fill(0.0); }
        //totalLengths.forEach(item => item = new Array(12).fill(0.0));
        //k: source measure, v: array of sets of numbers
        let uniquePitches: Map = new Map();

        for (let staveInd: number = 0; staveInd < measureInds.length; ++staveInd)
        {
            for (let ind: number of measureInds[staveInd])
            {
                const measure = this.SourceMeasures[ind - 1];
                if (!measures.has(measure))
                {
                    measures.set(measure, [staveInd]);
                }
                else
                {
                    measures.get(measure).push(staveInd);
                }
            }
        }
        const staves: Staff[] = new Array(0);
        for (let part: Instrument of this.Parts)
        {
            part.Staves.forEach(stave => staves.push(stave));
        }

        for (let staveInd: number = 0; staveInd < staves.length; ++staveInd)
        {
            for (let voice: Voice of staves[staveInd].Voices)
            {
                for (let voiceEntry: VoiceEntry of voice.VoiceEntries)
                {
                    for (let note: Note of voiceEntry.Notes)
                    {
                        //collecting measure's chords
                        if (!chords.has(note.SourceMeasure))
                        {
                            chords.set(note.SourceMeasure, new Set(
                                voiceEntry.ParentSourceStaffEntry.ChordContainers));
                        }
                        else
                        {
                            voiceEntry.ParentSourceStaffEntry.ChordContainers.
                                forEach(chord => chords.get(note.SourceMeasure).add(chord));
                        }

                        if (!note.isRest())
                        {
                            const length: number = note.Length.RealValue;
                            const pitch: Pitch = note.Pitch;
                            const pitchAsInt: number = (pitch.fundamentalNote
                                + Pitch.HalfTonesFromAccidental(pitch.Accidental)
                                + 12) % 12;
                            totalLengths[staveInd][pitchAsInt] += length;

                            //if note is legit
                            if (measures.get(note.SourceMeasure) &&
                                measures.get(note.SourceMeasure).includes(staveInd))
                            {
                                if (!specificLengths.has(note.SourceMeasure))
                                {
                                    const arr = new Array(staves.length);
                                    for (let i = arr.length; i--; )
                                    {
                                        arr[i] = new Array(12).fill(0);
                                    }
                                    specificLengths.set(note.SourceMeasure, arr);
                                }
                                specificLengths.get(note.SourceMeasure)[staveInd][pitchAsInt]
                                    += length;

                                if (!uniquePitches.has(note.SourceMeasure))
                                {
                                    uniquePitches.set(note.SourceMeasure,
                                        new Array(staves.length));
                                }
                                if (!uniquePitches.get(note.SourceMeasure)[staveInd])
                                {
                                    uniquePitches.get(note.SourceMeasure)[staveInd] =
                                        new Set([pitchAsInt]);
                                }
                                else
                                {
                                    uniquePitches.get(note.SourceMeasure)[staveInd].add(
                                        pitchAsInt);
                                }
                            }
                        }
                    }
                }
            }
        }
        let chordsOfSheet: ChordSymbolContainer[] = new Array(staves.length);
        for (let tempInd = 0; tempInd < staves.length; ++tempInd)
        {
            chordsOfSheet[tempInd] = KrumhanslSchmuckler.getChord(totalLengths[tempInd]);
        }
        for (let [measure, inds] of measures.entries())
        {
            const measureChords: ChordSymbolContainer[] = ImcorviseMusicSheet.getChords(
                chords, measure, this.SourceMeasures);
                // need to guess using krumahsnl-schmuckler on
                // measure's notes if it has 2+ notes or entire piece
            for (let staveInd: number of inds)
            {
                if (measureChords.length === 0)
                {
                    let chord: ChordSymbolContainer;
                    if (uniquePitches.get(measure)
                        && uniquePitches.get(measure)[staveInd].size >= 2)
                    {
                        chord = KrumhanslSchmuckler.getChord(
                            specificLengths.get(measure)[staveInd]);
                    }
                    else
                    {
                        chord = chordsOfSheet[staveInd];
                    }
                    ImcorviseMusicSheet.modifyMeasure(staves[staveInd], measure, chord);
                }
                else
                {
                    ImcorviseMusicSheet.modifyMeasure(
                        staves[staveInd], measure, measureChords[0]);
                }
            }
        }
    }

}
