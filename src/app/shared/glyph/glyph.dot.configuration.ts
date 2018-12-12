import { GlyphConfiguration } from './glyph.configuration';

export class DotGlyphConfiguration extends GlyphConfiguration {
    private _drawAggregate = false;

    public clone(): GlyphConfiguration {
        const newObject = new DotGlyphConfiguration();
        newObject.drawAggregate = this.drawAggregate;
        newObject.useCoordinateSystem = this.useCoordinateSystem;
        newObject.scaleLinear = this.scaleLinear;
        newObject.accessors = this.accessors;
        newObject.useCategories = this.useCategories;
        newObject.useLabels = this.useLabels;
        return newObject;
      }

    get drawAggregate(): boolean { return this._drawAggregate; }
    set drawAggregate(drawAggregate: boolean) { this._drawAggregate = drawAggregate; }
}

