import { Glyph } from './glyph';
import { FlowerGlyphConfiguration } from './glyph.flower.configuration';
import * as d3 from 'd3';
import { GlyphType } from './glyph.type';

export class FlowerGlyph extends Glyph {
    private radians: number;

    constructor(context: any, color: any, configuration: FlowerGlyphConfiguration) {
        super(context, color);
        this.configuration = configuration;
        this.glyphType = GlyphType.Flower;
    }

    public draw(position: any, features: any, progress?: number, isPassive?: boolean, isHighlighted?: boolean) {
      if (progress === 0) {
        return;
      }
      if (isPassive === undefined) {
        isPassive = false;
      }
      if (isHighlighted === undefined) {
        isHighlighted = false;
      }

      const acc = this.configuration.accessors;
      this.radians = 2 * Math.PI / acc.length;
      this.context.save();

      progress = (progress || 1);
      const r = Math.PI * 2;
      const radius: number = isHighlighted ? this.configuration.radius * progress * 1.3 : this.configuration.radius * progress;

      const scale = this.getCurrentScale(this.configuration.scaleLinear, radius);

      const context = this.context;
      context.globalCompositeOperation = isPassive ? 'destination-over' : 'source-over';

      // fill background area
      if (this.flowerConfig().useArea) {
        this.fillArea(position, features, radius, progress);
      }

      // draw border-circle
      if (this.flowerConfig().useCircle) {
        this.drawCircle(position, radius, progress);
      }

      // draw axes for all not-null-values
      if (this.flowerConfig().useCoordinateSystem) {
        this.drawAxes(position, features, radius, progress);
      }

      // possibly skip drawing petals
      if (!this.flowerConfig().usePetals) {
        return;
      }

      // draw petals
      context.beginPath();

      // translate origin of context to use relative path-coordinates for petals
      context.translate(position.x, position.y);
      context.lineWidth = 2;
      context.fillStyle = isPassive ? '#ccc' : this.color(features);
      this.context.lineWidth = isHighlighted ? 5 : 1;
      context.strokeStyle = isHighlighted
        ? Glyph.rgbToString(Glyph.inverseColorRgbFromRgb(Glyph.hexToRgb(this.color(features))))
        : context.fillStyle;

      // setup
      const path = d3.line().curve(d3.curveBasis);
      let p: Path2D;
      let flowerPath: any;
      let value: number;
      let dx: number;

      context.rotate(Math.PI / 2);

      let sumOfFeatureValues = 0;

      this.configuration.accessors.forEach((d: any, i: number) => {
        flowerPath = [];
        value = scale(d(features));
        dx = value * 0.23;
        if (value > 0) { sumOfFeatureValues += value };

        if (value > 0) {
          flowerPath.push(
            [0, 0],
            [0.2 * dx, -value * (10 / 19)],
            [dx, -value * 0.89],
            [0, -value * 1.03],
            [-dx, -value * 0.89],
            [-0.2 * dx, -value * (10 / 19)],
            [0, 0]);

          p = new Path2D(path(flowerPath) as any);

          if (this.flowerConfig().useBrightness && !isPassive) {
            context.fillStyle = this.applyBrightness(value, radius, features);
          }

          // draw petal
          context.stroke(p);
          context.fill(p);
        }
        context.rotate(this.radians); // rotate context to match axis
      });

      this.context.closePath();
      this.context.restore();

      // Draw a dot in case no features can be shown
      if (sumOfFeatureValues <= 0) {
        this.context.save();
        this.context.beginPath();
        this.context.fillStyle = isPassive ? '#ccc' : this.color(features);
        this.context.arc(position.x, position.y, 3.5 * progress, 0, 2 * Math.PI);
        this.context.fill();
        this.context.closePath();
        this.context.restore();
      }
    }

    public drawWithLabels(position: any, features: any, progress?: number, isPassive?: boolean, labels?: string[]) {
      this.draw(position, features, progress, isPassive);

      if (labels == null) {
        labels = [];
      }

      this.drawLabels(position, features, this.configuration.radius, progress, labels);
    }

    private applyBrightness(value: number, radius: number, features: any): string {
      let brightnessColor: string;
      const d3Color: any = d3.rgb(this.color(features));
      if (value > radius / 2) {
        brightnessColor = d3Color.darker(value / (2 * radius));
      } else {
        brightnessColor = d3Color.brighter(radius / (2 * value));
      }
      return brightnessColor;
    }

    private drawAxes(position: any, features: any, radius: number, progress: number): void {
      this.context.save();
      this.context.beginPath();
      this.context.lineWidth = 1;
      this.context.strokeStyle = `rgba(175, 175, 175, ${progress})`;

      let angle = 0;
      this.configuration.accessors.forEach((d: any) => {
        this.context.moveTo(position.x, position.y);
        const x: number = radius * Math.cos(angle) + position.x;
        const y: number = radius * Math.sin(angle) + position.y;

        angle += this.radians;

        // don't draw axis if value is not valid
        if (isNaN(d(features))) {
          return;
        }

        this.context.lineTo(x, y);
      });

      this.context.stroke();
      this.context.closePath();
      this.context.restore();
    }

    private drawLabels(position: any, features: any, radius: number, progress: number, labels: string[]): void {
      this.context.save();
      this.context.beginPath();
      this.context.lineWidth = 1;
      this.context.strokeStyle = `rgba(175, 175, 175, ${progress})`;

      let angle = 0;
      this.configuration.accessors.forEach((d: any, i: number) => {
        this.context.moveTo(position.x, position.y);

        const lx: number = radius * 1.75 * Math.cos(angle) + position.x;
        const ly: number = radius * 1.75 * Math.sin(angle) + position.y;

        this.context.textAlign = 'center';
        this.context.font = '14px Glyphboard-Condensed';
        this.context.fillStyle = '#ebebeb';
        this.context.fillText(labels[i], lx, ly);

        angle += this.radians;
      });

      this.context.stroke();
      this.context.closePath();
      this.context.restore();
    }

    private fillArea(position: any, features: any, radius: number, progress: number): void {
      this.context.save();
      this.context.beginPath();

      this.context.moveTo(position.x + radius, position.y);

      let previousAccessor = null;
      let firstAccessor = null;
      let angle = 0

      // draw the segments of the full circle and leave out all null axes
      this.configuration.accessors.forEach((a) => {
        if (!firstAccessor) {
          firstAccessor = a;
        } else if (!isNaN(a(features)) && !isNaN(previousAccessor(features))) {
          // only draw segment if both start and end-points are non-null values
          this.context.moveTo(Math.cos(angle) + position.x, Math.sin(angle) + position.y);
          this.context.arc(position.x, position.y, radius, angle - this.radians, angle);
          this.context.moveTo(position.x, position.y);
        }

        previousAccessor = a;
        angle += this.radians;
      });

      // draw the last segment
      if (!isNaN(firstAccessor(features)) && !isNaN(previousAccessor(features))) {
        this.context.moveTo(Math.cos(angle) + position.x, Math.sin(angle) + position.y);
        this.context.arc(position.x, position.y, radius, angle - this.radians, angle);
        this.context.moveTo(position.x, position.y);
      }

      this.context.fillStyle = this.flowerConfig().usePetals
        ? `rgba(225, 225, 225, ${progress * 0.73})`
        : this.color(features);

      this.context.strokeStyle = this.flowerConfig().usePetals
        ? 'rgba(0,0,0,0)'
        : this.color(features);

      this.context.fill();
      this.context.stroke();

      this.context.closePath();
      this.context.restore();
    }

    private drawCircle(position: any, radius: number, progress: number): void {
      this.context.save();
      this.context.beginPath();

      this.context.moveTo(position.x + radius, position.y);

      this.context.arc(position.x, position.y, radius, 0, Math.PI * 2);
      this.context.lineWidth = 1;
      this.context.strokeStyle = `rgba(200, 200, 200, ${progress})`;
      this.context.stroke();

      this.context.closePath();
      this.context.restore();
    }

    private flowerConfig(): FlowerGlyphConfiguration {
      return this.configuration as FlowerGlyphConfiguration;
    }
}
