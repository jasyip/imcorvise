import
{
    ChordSymbolContainer,
    Pitch,
    ChordSymbolEnum,
    Note,
    VoiceEntry,
    SourceStaffEntry,
    SourceMeasure
}
    from "opensheetmusicdisplay";


export class ChordToNotes
{

    private static getInts(chord: ChordSymbolContainer): number[]
    {
        switch (chord.ChordKind)
        {
            case ChordSymbolEnum.major: return [0, 0, 4, 0, 7];
            case ChordSymbolEnum.minor: return [0, 0, 3, 0, 7];
            case ChordSymbolEnum.augmented: return [0, 0, 4, 0, 8];
            case ChordSymbolEnum.diminished: return [0, 0, 3, 0, 6];
            case ChordSymbolEnum.dominant: return [0, 0, 4, 0, 7];
            case ChordSymbolEnum.majorseventh: return [0, 0, 4, 0, 7, 0, 11];
            case ChordSymbolEnum.minorseventh: return [0, 0, 3, 0, 7, 0, 10];
            case ChordSymbolEnum.diminishedseventh: return [0, 0, 3, 0, 6, 0, 9];
            case ChordSymbolEnum.augmentedseventh: return [0, 0, 4, 0, 8, 0, 10];
            case ChordSymbolEnum.halfdiminished: return [0, 0, 3, 0, 6, 0, 10];
            case ChordSymbolEnum.majorminor: return [0, 0, 3, 0, 7, 0, 11];
            case ChordSymbolEnum.majorsixth: return [0, 0, 4, 0, 7, 9];
            case ChordSymbolEnum.minorsixth: return [0, 0, 3, 0, 7, 9];
            case ChordSymbolEnum.dominantninth: return [0, 2, 4, 0, 7, 0, 10];
            case ChordSymbolEnum.majorninth: return [0, 2, 4, 0, 7, 0, 11];
            case ChordSymbolEnum.minorninth: return [0, 2, 3, 0, 7, 0, 10];
            case ChordSymbolEnum.dominant11th: return [0, 2, 4, 5, 7, 0, 10];
            case ChordSymbolEnum.major11th: return [0, 2, 4, 5, 7, 0, 11];
            case ChordSymbolEnum.minor11th: return [0, 2, 3, 5, 7, 10];
            case ChordSymbolEnum.dominant13th: return [0, 2, 4, 5, 7, 9, 10];
            case ChordSymbolEnum.major13th: return [0, 2, 4, 6, 7, 9, 11];
            case ChordSymbolEnum.minor13th: return [0, 2, 3, 5, 7, 9, 10];
            case ChordSymbolEnum.suspendedsecond: return [0, 2, 0, 0, 7];
            case ChordSymbolEnum.suspendedfourth: return [0, 0, 0, 5, 7];
            case ChordSymbolEnum.Neapolitan: return [0, 0, 3, 0, 0, 8];
            case ChordSymbolEnum.Italian: return [0, 0, 4, 0, 0, 10];
            case ChordSymbolEnum.French: return [0, 0, 4, 6, 0, 10];
            case ChordSymbolEnum.German: return [0, 0, 4, 0, 7, 10];
            case ChordSymbolEnum.Tristan return [0, 3, 0, 6, 0, 10];
            

        }
    }

}
