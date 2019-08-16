import { Glyph } from './glyph';
import { GlyphType } from './glyph.type';
import { DotGlyphConfiguration } from './glyph.dot.configuration';

export class LabelGlyph extends Glyph {
  private preferredRadius = 3.5;
  constructor(
    context: CanvasRenderingContext2D,
    color: any,
    configuration: DotGlyphConfiguration
  ) {
    super(context, color);
    this.configuration = configuration;
    this.glyphType = GlyphType.Dot;
  }

  public draw(
    position: any,
    features: any,
    progress?: number,
    isPassive?: boolean,
    isHighlighted?: boolean,
    animationProgress?: number
  ) {
    if (progress === 0) {
      return;
    }
    if (isPassive === undefined) {
      isPassive = false;
    }
    if (isHighlighted === undefined) {
      isHighlighted = false;
    }

    progress = progress || 1;
    let rad = this.dotConfig().drawAggregate
      ? position.weight / this.preferredRadius
      : this.preferredRadius;
    if (rad >= 8) {
      rad = 8;
    }
    if (rad <= this.preferredRadius) {
      rad = this.preferredRadius;
    }
    const radius = isHighlighted ? rad * 1.3 * progress : rad * progress;
    const opacity = 1 - animationProgress;
    const inverseColorRGB = Glyph.inverseColorRgbFromRgb(
      Glyph.hexToRgb(this.color(features))
    );

    this.context.globalCompositeOperation = isPassive
      ? 'destination-over'
      : 'source-over';

    // pulse
    if (isHighlighted) {
      this.context.beginPath();
      this.context.fillStyle =
        'rgba(' +
        inverseColorRGB[0] +
        ', ' +
        inverseColorRGB[1] +
        ', ' +
        inverseColorRGB[2] +
        ', ' +
        opacity +
        ')';
      this.context.arc(
        position.x,
        position.y,
        radius + animationProgress * 20,
        0,
        2 * Math.PI
      );
      this.context.fill();
    }

    const fillColor = isPassive ? '#ccc' : this.color(features);
    this.context.fillStyle = fillColor;
    this.context.strokeStyle = fillColor;
    this.context.lineWidth = isHighlighted ? 5 : 1;

    // Handle unlabeled data
    if (features['31'] === 0) {
      let strokeColor = 'black';
      this.context.beginPath();
      let color = this.lightenDarkenColor('#9e9e9e', this.normalize(features['32'], 100, 0));
      if (isPassive) {
        color = '#ccc';
        strokeColor = color;
      }
      this.context.fillStyle = color;
      this.context.strokeStyle = strokeColor;
      this.context.lineWidth = 2;
      this.context.arc(
        position.x,
        position.y,
        radius * this.normalize(features['32'], 0.5, 1.75),
        0,
        2 * Math.PI
      );
      this.context.stroke();
      this.context.fill();
    } else {
      this.context.beginPath();
      this.context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
      if (
        position.weight === undefined ||
        position.weight === 1 ||
        !this.dotConfig().drawAggregate
      ) {
        this.context.fill();
      } else {
        this.context.stroke();
      }
    }

    // this.context.beginPath();
    // this.context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    // if (
    //   position.weight === undefined ||
    //   position.weight === 1 ||
    //   !this.dotConfig().drawAggregate
    // ) {
    //   this.context.fill();
    // } else {
    //   this.context.stroke();
    // }
  }

  public drawWithLabels(position: any, features: any, progress?: number) {
    return this.draw(position, features, progress);
  }

  public dotConfig() {
    return this.configuration as DotGlyphConfiguration;
  }

  /**
   * Helper function: Normalizes a value into specified min-max-range
   * @param val value to be normalized
   * @param target_min min boundary
   * @param target_max max boundary
   * @param min minimum real value can reach
   * @param max maximum reaö value can reach
   */
  private normalize(
    val: number,
    target_min: number,
    target_max: number,
    min: number = 0,
    max: number = 1
  ): number {
    return ((target_max - target_min) / (max - min)) * (val - max) + target_max;
  }

  /* tslint:disable */
  private lightenDarkenColor(col, amt) {
    let usePound = false;

    if (col[0] === '#') {
      col = col.slice(1);
      usePound = true;
    }

    const num = parseInt(col, 16);

    let r = (num >> 16) + amt;

    if (r > 255) { r = 255; } else if (r < 0) { r = 0; }

    let b = ((num >> 8) & 0x00ff) + amt;

    if (b > 255) { b = 255; } else if (b < 0) { b = 0; }

    let g = (num & 0x0000ff) + amt;

    if (g > 255) { g = 255; } else if (g < 0) { g = 0; }

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
  }
}
