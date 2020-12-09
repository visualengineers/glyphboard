import { GlyphConfiguration } from './glyph.configuration';
import { GlyphType } from './glyph.type';

export class StarGlyphConfiguration extends GlyphConfiguration {
  private _useContour = true;
  private _useAbsoluteAxes = true;
  private _useAreaFill = true;
  private _useBackground = false;

  private starOptions = [
    { property: 'useCoordinateSystem', label: 'Coordinate System' },
   // { property: 'useCategories', label: 'Categories' },
    { property: 'useContour', label: 'Contour' },
    { property: 'useAreaFill', label: 'Surface' },
    { property: 'useAbsoluteAxes', label: 'Axes Absolute' },
    { property: 'scaleLinear', label: 'Linear Scale' }
  ];

  constructor() {
    super();
    this.glyphOptions = this.starOptions;
    this.glyphType = GlyphType.Star;

    this.useCoordinateSystem = true;
    this.useContour = true;
    this.useAreaFill = true;
    this.useAbsoluteAxes = true;
  }

  public clone(): GlyphConfiguration {
    const newObject = new StarGlyphConfiguration();
    newObject.radius = this.radius;
    newObject.useContour = this.useContour;
    newObject.useCoordinateSystem = this.useCoordinateSystem;
    newObject.useAreaFill = this.useAreaFill;
    newObject.useAbsoluteAxes = this.useAbsoluteAxes;
    newObject.scaleLinear = this.scaleLinear;
    newObject.accessors = this.accessors;
    newObject.useCategories = this.useCategories;
    newObject.useLabels = this.useLabels;
    return newObject;
  }

  get useContour(): boolean { return this._useContour; }
  set useContour(flag: boolean) { this._useContour = flag; }

  get useAreaFill(): boolean { return this._useAreaFill; }
  set useAreaFill(flag: boolean) { this._useAreaFill = flag; }

  get useAbsoluteAxes(): boolean { return this._useAbsoluteAxes; }
  set useAbsoluteAxes(flag: boolean) { this._useAbsoluteAxes = flag; }

  
  get useBackground(): boolean { return this._useBackground; }
  set useBackground(flag: boolean) { this._useBackground = flag; }
}
