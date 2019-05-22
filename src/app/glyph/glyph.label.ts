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
    if (!features.isLabeled) {
      this.context.beginPath();
      // this.context.fillStyle = '#9e9e9e';
      // this.context.strokeStyle = 'black';
      this.context.arc(
        position.x,
        position.y,
        radius * this.normalize(features.score, 0.5, 1.5, 0, 0.5),
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
    min: number = 0.5,
    max: number = 1
  ): number {
    return ((target_max - target_min) / (max - min)) * (val - max) + target_max;
  }
}
