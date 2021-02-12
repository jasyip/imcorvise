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
    VerticalSourceStaffEntryContainer,
    KeyInstruction
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
        //k: source measure, v: array of sets of numbers
        this.uniquePitches = new Map();
        //k: source measure, v: array of keyinstructions
        this.keySignatures = new Map();
    }

    private selectedMeasures: Map;
    private chords: Map;
    private specificLengths: Map;
    private totalLengths: number[][];
    private uniquePitches: Map;
    private keySignatures: Map;
    private staves: Staff[];
    

    private generateNote
    (
        chord: ChordSymbolContainer,
        staffInd: number,
        measure: SourceMeasure,
        timestamp: Fraction,
        duration: Fraction,
        pitch: Pitch,
        isRest: boolean,
    )
    : void 
    {
        let addChord: boolean = measure.VerticalSourceStaffEntryContainers.length === 0;
        if (!addChord)
        {
            addChord = true;
            for (let vssec of measure.VerticalSourceStaffEntryContainers)
            {
                if (vssec.StaffEntries[staffInd])
                {
                    addChord = false;
                    break;
                }
            }
        }
        const staffEntry = measure.findOrCreateStaffEntry(
            timestamp, 0, this.staves[staffInd]).staffEntry;
        const voiceEntry = measure.findOrCreateVoiceEntry(
            staffEntry, this.staves[staffInd].Voices[0]).voiceEntry;
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

    private addRest
    (
        chord: ChordSymbolContainer,
        staffInd: number,
        measure: SourceMeasure,
        curPos: Fraction,
        curRestDur: Fraction
    )
    : void
    {
        let added: number = 0;
        for (let i = 8; i >= 1; i >>= 1)
        {
            if (curPos.Denominator === i && curRestDur.Numerator > 0
                && curRestDur.Denominator === i)
            {
                this.generateNote(chord, staffInd, measure, curPos.clone(),
                    new Fraction(1, i), undefined, true);
                added |= i;
                curPos.Add(new Fraction(1, i));
                curRestDur.Sub(new Fraction(1, i));
            }
        }
        for (let i = 1; i <= 8; i <<= 1)
        {
            if (!(added & i) && curRestDur.gte(new Fraction(1, i)))
            {
                this.generateNote(chord, staffInd, measure, curPos.clone(),
                    new Fraction(1, i), undefined, true);
                curPos.Add(new Fraction(1, i));
                curRestDur.Sub(new Fraction(1, i));
            }
        }
    }

    private getKeyInstruction(measure: SourceMeasure, staffInd: number): KeyInstruction
    {
        let previousMeasure = measure;
        while (previousMeasure)
        {
            const out: KeyInstruction = previousMeasure.getKeyInstruction(staffInd);
            if (out)
            {
                return out;
            }
            previousMeasure = this.SourceMeasures[previousMeasure.measureListIndex - 1];
        }
        return undefined;
    }

    private modifyMeasure
    (
        staffInd: number,
        measure: SourceMeasure,
        chord: ChordSymbolContainer,
        preferSharps: boolean = true,
    )
    : void
    {
        for (let i = measure.VerticalSourceStaffEntryContainers.length; --i >= 0; )
        {
            let vssecs = measure.VerticalSourceStaffEntryContainers[i];
            vssecs.StaffEntries[staffInd] = undefined;
            if (vssecs.StaffEntries.every(e => e === undefined))
            {
                measure.VerticalSourceStaffEntryContainers.splice(i, 1);
            }
        }
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

        let curRestDur: Fraction = new Fraction();
        let curPos: Fraction = new Fraction();
        for (let i = 0; i < scaleInts.length; ++i)
        {
            if (accidentals[i])
            {
                this.addRest(chord, staffInd, measure, curPos, curRestDur);
                this.generateNote(chord, staffInd, measure,
                    curPos.clone(), new Fraction(1, 8),
                    new Pitch(majorInts[i], i < 3 ? 2 : 1,
                    Pitch.AccidentalFromHalfTones(accidentals[i])), false);
                curPos.Add(new Fraction(1, 8));
            }
            else
            {
                curRestDur.Add(new Fraction(1, 8));
            }
        }
        curRestDur.Add(new Fraction(1, 8));
        this.addRest(chord, staffInd, measure, curPos, curRestDur);

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
            previousMeasure = this.SourceMeasures[previousMeasure.measureListIndex - 1];
        }
        return new Array(0);
    }

    private static del(staffInd: number, ...measures: SourceMeasure[]): void
    {
        for (const measure of measures)
        {
            measure.FirstInstructionsStaffEntries[staffInd].
                removeFirstInstructionOfTypeKeyInstruction();
        }
    }
    private static replace(staffInd: number, ...measures: SourceMeasure[]): void
    {
        for (const measure of measures)
        {
            measure.FirstInstructionsStaffEntries[staffInd].Instructions.splice(
                measure.FirstInstructionsStaffEntries[staffInd].Instructions.
                findIndex(e => e instanceof KeyInstruction), 1, new KeyInstruction());
        }
    }
    private static add(staffInd: number, measure: SourceMeasure, key: KeyInstruction): void
    {
        if (!measure.hasBeginInstructions())
        {
            measure.FirstInstructionsStaffEntries[staffInd] = new SourceStaffEntry(
                undefined, undefined);
        }
        measure.FirstInstructionsStaffEntries[staffInd].Instructions.push(
            KeyInstruction.copy(key));
    }


    private changeKS(measure: SourceMeasure, staffInd: number): void
    {
        const prevMeasure: SourceMeasure = this.SourceMeasures[measure.measureListIndex - 1];
        const nextMeasure: SourceMeasure = this.SourceMeasures[measure.measureListIndex + 1];

        const prevKey: KeyInstruction = this.getKeyInstruction(prevMeasure, staffInd);
        const curKey: KeyInstruction = this.getKeyInstruction(measure, staffInd);
        const nextKey: KeyInstruction = this.getKeyInstruction(nextMeasure, staffInd);

        const prevC: boolean = (prevKey === undefined) ? false :
            (prevKey.AlteratedNotes.length === 0);
        const curC: boolean = curKey.AlteratedNotes.length === 0;
        const nextC: boolean = (nextKey === undefined) ? false :
            (nextKey.AlteratedNotes.length === 0);
        const curNew: boolean = measure.getKeyInstruction(staffInd) !== undefined;
        const nextNew: boolean = nextMeasure.getKeyInstruction(staffInd) !== undefined;
        
        if (prevC)
        {
            if (curNew && !curC && nextNew && nextC)
            {
                ImcorviseMusicSheet.del(staffInd, measure, nextMeasure);
            }
            else if (curNew && !curC && nextNew && !nextC)
            {
                ImcorviseMusicSheet.del(staffInd, measure);
            }
            else if (curNew && !curC && !nextNew && !nextC)
            {
                ImcorviseMusicSheet.del(staffInd, measure);
                if (nextMeasure)
                {
                    ImcorviseMusicSheet.add(staffInd, nextMeasure, nextKey);
                }
            }
        }
        else
        {
            if (curNew && !curC && nextNew && nextC)
            {
                ImcorviseMusicSheet.replace(staffInd, measure);
                ImcorviseMusicSheet.del(staffInd, nextMeasure);
            }
            else if (!curNew && !curC && nextNew && nextC)
            {
                ImcorviseMusicSheet.add(staffInd, measure, new KeyInstruction());
                ImcorviseMusicSheet.del(staffInd, nextMeasure);
            }
            else if (curNew && !curC && !nextNew && nextC)
            {
                ImcorviseMusicSheet.replace(staffInd, measure);
            }
            else if (curNew && !curC && nextNew && !nextC)
            {
                ImcorviseMusicSheet.replace(staffInd, measure);
            }
            else if (!curNew && !curC && nextNew && !nextC)
            {
                ImcorviseMusicSheet.add(staffInd, measure, newKeyInstruction);
            }
            else if (curNew && !curC && !nextNew && !nextC)
            {
                ImcorviseMusicSheet.replace(staffInd, measure);
                if (nextMeasure)
                {
                    ImcorviseMusicSheet.add(staffInd, nextMeasure, nextKey);
                }
            }
            else if (!curNew && !curC && !nextNew && !nextC)
            {
                ImcorviseMusicSheet.add(staffInd, measure, new KeyInstruction());
                if (nextMeasure)
                {
                    ImcorviseMusicSheet.add(staffInd, nextMeasure, nextKey);
                }
            }
        }
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
                        if (this.selectedMeasures.get(note.SourceMeasure) &&
                            this.selectedMeasures.get(note.SourceMeasure).includes(staveInd))
                        {
                            if (!this.keySignatures.has(note.SourceMeasure))
                            {
                                this.keySignatures.set(note.SourceMeasure,
                                    new Array(this.staves.length));
                            }
                            if (!this.keySignatures.get(note.SourceMeasure).some(e => e))
                            {
                                this.keySignatures.get(note.SourceMeasure)[staveInd] =
                                    this.getKeyInstruction(note.SourceMeasure);
                            }
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
                }
            }
        }
        let chordsOfSheet: ChordSymbolContainer[] = new Array(this.staves.length);
        for (let tempInd = 0; tempInd < this.staves.length; ++tempInd)
        {
            chordsOfSheet[tempInd] = KrumhanslSchmuckler.getChord(this.totalLengths[tempInd]);
        }
        for (let [measure, inds] of Array.from(this.selectedMeasures.entries()).sort(
            (a, b) => a[0].MeasureNumber - b[0].MeasureNumber))
        {
            const measureChords: ChordSymbolContainer[] = this.getChords(measure);
                // need to guess using krumahsnl-schmuckler on
                // measure's notes if it has 2+ notes or entire piece
            for (let staveInd: number of inds)
            {
                this.changeKS(measure, staveInd);
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
                    this.modifyMeasure(staveInd, measure, chord);
                }
                else
                {
                    this.modifyMeasure(staveInd, measure, measureChords[0]);
                }
            }
        }

    }

}
