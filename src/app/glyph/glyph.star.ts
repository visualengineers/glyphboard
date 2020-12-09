import { Glyph } from './glyph';
import { StarGlyphConfiguration } from './glyph.star.configuration';
import * as d3 from 'd3';
import { GlyphType } from './glyph.type';

export class StarGlyph extends Glyph {
  private radians: number = 0;

  constructor(context: any, color: any, configuration: StarGlyphConfiguration) {
    super(context, color);
    this.glyphType = GlyphType.Star;
    this.configuration = configuration;
  }

  draw(position: any, features: any, progress?: number, isPassive?: boolean, isHighlighted?: boolean) {
    if (isPassive === undefined) {
      isPassive = false;
    }
    if (isHighlighted === undefined) {
      isHighlighted = false;
    }

    this.radians = 2 * Math.PI / this.configuration.accessors.length;
    this.context.save();
    progress = (progress || 1);

    const r: number = Math.PI * 2;
    const radius: number = isHighlighted ? this.configuration.radius * progress * 1.3 : this.configuration.radius * progress;
    const scale = this.getCurrentScale(this.configuration.scaleLinear, radius);
    const context = this.context;

    context.globalCompositeOperation = isPassive ? 'destination-over' : 'source-over';
    context.beginPath();
    if(this.starConfig().useBackground){
      context.fillStyle = '#ccc';
      context.opacity = 0.5;
      context.arc(position.x, position.y, radius, 0, 2 * Math.PI);
      context.fill();
    }
    if (this.configuration.useCoordinateSystem) {
      this.drawAxes(position, features, radius, progress);
    }

    // draw shape along axes
    const fillData: Array<any> = [];
    const contourData: Array<any> = [];
    const undefinedVs: Array<any> = []; // stores indeces with undef. values
    let angle: number = Math.PI / 2;
    let v: number; // current value along the axis
    let sumOfFeatureValues = 0;

    context.strokeStyle = `rgba(200, 200, 200, ${progress})`;

    context.translate(position.x, position.y);

    this.configuration.accessors.forEach((d: any, i: number) => {
      v = scale(d(features));
      if (v > 0) { sumOfFeatureValues += v };

      // keep track of all undefined values to exclude them from the path
      if (isNaN(v))  {
        undefinedVs.push(i);
        v = 0;
      }

      fillData.push([angle, v]);
      contourData.push([angle, v]);

      angle += this.radians;
    });

    // add the first point again for a potentially closed path
    if (!isNaN(scale(this.configuration.accessors[0](features)))) {
      contourData.push([Math.PI / 2, scale(this.configuration.accessors[0](features))]);
    }

    // use the undefinedVs as indicator for continuity of the contouring path
    const contour = d3.radialLine()
      .defined((d: any, i: number) => undefinedVs.indexOf(i) === -1);
    // the filled path should be zero for undefined values, which avoids holes
    // between the filled area and the contour
    const fill = d3.radialLine();

    const p: Path2D = new Path2D(fill(fillData) as any);
    const c: Path2D = new Path2D(contour(contourData) as any);

    if (this.starConfig().useContour) {
      context.strokeStyle = isHighlighted
        ? Glyph.rgbToString(Glyph.inverseColorRgbFromRgb(Glyph.hexToRgb(this.color(features))))
        : this.color(features);
    } else {
      context.strokeStyle = isHighlighted
        ? Glyph.rgbToString(Glyph.inverseColorRgbFromRgb(Glyph.hexToRgb(this.color(features))))
        : `rgba(${Glyph.hexToRgb(this.color(features)).join(',')},.3)`;
    }
    if (isPassive) {
      context.strokeStyle = '#aaa';
    }

    context.lineWidth = isHighlighted ? 5 : 2;

    // set opacity of fill coloring in respect to the contouring value. If countour is true, use
    // the more opaque version to create better contrast to between fill and contour
    let fillColor = d3.color(this.color(features));
    if (fillColor == null) {
      fillColor = d3.color('white');
    }
    if(fillColor !== null) {
      fillColor.opacity = this.starConfig().useContour ? 0.3 : 0.5;
      if (isHighlighted) {
        fillColor.opacity = 0.9;
      }
    }
    context.fillStyle = isPassive ? '#ccc' : `${fillColor}`;

    context.translate(position.cx, position.cy);
    context.stroke(c);

    if (this.starConfig().useAreaFill) {
      context.fill(p);
    }

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

  drawWithLabels(position: any, features: any, progress?: number, isPassive?: boolean, labels?: string[]) {
    this.draw(position, features, progress, isPassive);

    if (labels == null) { labels = []; }

    this.drawLabels(position, features, this.configuration.radius, labels, progress);
  }

  private drawAxes(position: any, features: any, radius: number, progress: number): void {
    const that = this;
    this.context.save();
    this.context.beginPath();
    this.context.strokeStyle = `rgba(140, 140, 140, ${progress})`;
    this.context.lineWidth = 1;

    let x: number;
    let y: number;
    let angle = 0; // angle of axis
    let v: number; // value along axis

    const scale = this.getCurrentScale(this.configuration.scaleLinear, radius);

    this.configuration.accessors.forEach((d: any) => {
      this.context.moveTo(position.x, position.y);

      if (this.starConfig().useAbsoluteAxes) {
        x = radius * Math.cos(angle) + position.x;
        y = radius * Math.sin(angle) + position.y;
      } else {
        v = scale(d(features));
        x = v * Math.cos(angle) + position.x;
        y = v * Math.sin(angle) + position.y;
      }

      angle += this.radians;

      // don't draw axis if value is not valid
      if (isNaN(d(features))) { return; }

      this.context.lineTo(x, y);
    });

    this.context.stroke();
    this.context.closePath();
    this.context.restore();

  }

  private drawLabels(position: any, features: any, radius: number, labels: string[], progress?: number): void {
    const that = this;
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

  private starConfig(): StarGlyphConfiguration {
    return this.configuration as StarGlyphConfiguration;
  }
}
