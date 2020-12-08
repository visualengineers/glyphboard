import * as d3 from 'd3';
import { GlyphType } from './glyph.type';
import { GlyphConfiguration } from './glyph.configuration';
import { FlowerGlyphConfiguration } from './glyph.flower.configuration';

export abstract class Glyph {
    private _configuration: GlyphConfiguration;
    public context: any;
    color: any;
    glyphType: GlyphType = GlyphType.Flower;

    static rgbToString(rgb: number[]): string {
        return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    }

    static inverseColorRgbFromRgb (rgb: [number, number, number]): number[] {
        return rgb.map((colorPartial) => {
          return 255 - colorPartial;
        });
    }

    static hexToRgb(hex: string): any {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0xFF, 0xFF, 0xFF]; // default color is white if hex is undefined
    }

    constructor(context: any, color: any) {
        this.color = color;
        this.context = context;
        this._configuration = new FlowerGlyphConfiguration;
    }

    abstract draw(position: any, features: any, progress?: number, isPassive?: boolean, isHighlighted?: boolean, animation?: number): void;
    abstract drawWithLabels(datum: any, features: any, progress?: number, isPassive?: boolean, labels?: string[]): void;

    getCurrentScale(linear: boolean, radius: number): any {
        return linear
            ? d3.scaleLinear()
                .clamp(true)
                .domain([0.1, 100])
                .range([0, radius])
            : d3.scaleLog()
                .clamp(true)
                .domain([0.1, 100])
                .range([0, radius]);
    }

    get configuration() { return this._configuration; }
    set configuration(value: GlyphConfiguration) { this._configuration = value; }
}
