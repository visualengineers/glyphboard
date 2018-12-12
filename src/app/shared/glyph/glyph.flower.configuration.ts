import { GlyphConfiguration } from './glyph.configuration';
import { GlyphType } from './glyph.type';

export class FlowerGlyphConfiguration extends GlyphConfiguration {
  private _useCircle: boolean;
  private _useArea: boolean;
  private _useBrightness: boolean;
  private _usePetals: boolean;

  private flowerOptions = [
    { property: 'useCoordinateSystem', label: 'Coordinate System' },
    // { property: 'useCategories', label: 'Categories' },
    { property: 'useCircle', label: 'Circle' },
    { property: 'useBrightness', label: 'Brightness' },
    { property: 'useArea', label: 'Area' },
    { property: 'usePetals', label: 'Petals' },
    { property: 'scaleLinear', label: 'Linear Scale' }
  ];

  constructor() {
    super();
    this.glyphOptions = this.flowerOptions;
    this.glyphType = GlyphType.Flower;

    this.useCoordinateSystem = true;
    this.useCircle = true;
    this.useBrightness = true;
    this.useArea = true;
    this.usePetals = true;
  }

  public clone(): GlyphConfiguration {
    const newObject = new FlowerGlyphConfiguration();
    newObject.radius = this.radius;
    newObject.useCircle = this.useCircle;
    newObject.useCoordinateSystem = this.useCoordinateSystem;
    newObject.useBrightness = this.useBrightness;
    newObject.useArea = this.useArea;
    newObject.usePetals = this.usePetals;
    newObject.scaleLinear = this.scaleLinear;
    newObject.accessors = this.accessors;
    newObject.useCategories = this.useCategories;
    newObject.useLabels = this.useLabels;
    return newObject;
  }

  get useCircle(): boolean { return this._useCircle; }
  set useCircle(flag: boolean) { this._useCircle = flag; }

  get useArea(): boolean { return this._useArea; }
  set useArea(flag: boolean) { this._useArea = flag; }

  get useBrightness(): boolean { return this._useBrightness; }
  set useBrightness(flag: boolean) { this._useBrightness = flag; }

  get usePetals(): boolean { return this._usePetals; }
  set usePetals(flag: boolean) { this._usePetals = flag; }
}
