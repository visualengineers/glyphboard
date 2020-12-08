import { GlyphType } from './glyph.type';

export abstract class GlyphConfiguration {
  private _useCoordinateSystem = true;
  private _useCategories = true;
  private _useLabels = false;
  private _radius = 0;
  private _accessors: any[] = [];
  private _scaleLinear = true;

  private _glyphType: GlyphType = GlyphType.Flower;

  private options = [
    { property: 'useCoordinateSystem', label: 'Coordinate System' },
    { property: 'useCategories', label: 'Categories' },
    { property: 'useLabels', label: 'Labels' }
  ];

  public abstract clone(): GlyphConfiguration;

  get useCoordinateSystem(): boolean { return this._useCoordinateSystem; }
  set useCoordinateSystem(flag: boolean) { this._useCoordinateSystem = flag; }

  get useCategories(): boolean { return this._useCategories; }
  set useCategories(flag: boolean) { this._useCategories = flag; }

  get useLabels(): boolean { return this._useLabels; }
  set useLabels(flag: boolean) { this._useLabels = flag; }

  get glyphOptions(): any { return this.options; }
  set glyphOptions(options: any) { this.options = options; }

  get glyphType(): GlyphType { return this._glyphType; }
  set glyphType(type: GlyphType) { this._glyphType = type; }

  get radius(): number { return this._radius; }
  set radius(r: number) { this._radius = r; }

  get accessors(): any[] { return this._accessors; }
  set accessors(acc: any[]) { this._accessors = acc; }

  get scaleLinear(): boolean { return this._scaleLinear; }
  set scaleLinear(scaleLinear: boolean) { this._scaleLinear = scaleLinear; }
}
