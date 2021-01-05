//stolen from https://github.com/Jon-Salmon/KrumhanslSchmuckler-php and converted to TS
import
{
    ChordSymbolContainer,
    ChordSymbolEnum,
    EngravingRules,
    Pitch
}
    from "opensheetmusicdisplay";

export class KrumhanslSchmuckler
{
    static readonly majorCoefficients: number[] =
        [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];

    static readonly minorCoefficients: number[] =
        [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

    public static getCorrelation(xs: number[], ys: number[]): number
    {
        const meanx: number = xs.reduce((a, b) => a + b, 0) / xs.length;
        const meany: number = ys.reduce((a, b) => a + b, 0) / ys.length;

        let a: number = 0;
        let b: number = 0;
        let axb: number = 0;
        let a2: number = 0;
        let b2: number = 0;

        for (let i = 0; i < xs.length; ++i)
        {
            a = xs[i] - meanx;
            b = ys[i] - meany;
            axb += a * b;
            a2 += Math.pow(a, 2);
            b2 += Math.pow(b, 2);
        }

        return axb / Math.sqrt(a2 * b2);
    }


    public static getChord(keyLengths: number[], rules: EngravingRules): ChordSymbolContainer
    {
        //A A#
        //6 2
        //^ - keylengths
        let maxCorrelation: number = 0;
        let maxIndex: number | null = null;
        let isMinor : boolean | null = null;
        let majorCoefficients: number[] = KrumhanslSchmuckler.majorCoefficients;
        let minorCoefficients: number[] = KrumhanslSchmuckler.minorCoefficients;



        for (let i = 0; i < keyLengths.length; ++i)
        {
            let majorCorrelation: number = Math.abs(KrumhanslSchmuckler.getCorrelation(
                majorCoefficients, keyLengths));
            let minorCorrelation: number = Math.abs(KrumhanslSchmuckler.getCorrelation(
                minorCoefficients, keyLengths));
            if (majorCorrelation > maxCorrelation)
            {
                maxCorrelation = majorCorrelation;
                maxIndex = i;
                isMinor = false;
            }
            if (minorCorrelation > maxCorrelation)
            {
                maxCorrelation = minorCorrelation;
                maxIndex = i;
                isMinor = true;
            }
            majorCoefficients.unshift(majorCoefficients.pop());
            minorCoefficients.unshift(minorCoefficients.pop());
            
        }
        const chord = new ChordSymbolContainer(Pitch.fromHalftone(maxIndex + 12 * 4),
            isMinor ? ChordSymbolEnum.minor : ChordSymbolEnum.major,
            undefined,
            undefined,
            rules);
        return chord;
    }
}

