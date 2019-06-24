import { InteractionEventData } from 'app/shared/events/interaction.event.data';
import { DotGlyph } from 'app/glyph/glyph.dot';
import { DotGlyphConfiguration } from 'app/glyph/glyph.dot.configuration';
import { Glyph } from 'app/glyph/glyph';
import { Point } from 'app/shared/types/point';

export class SelectionRect {
  private component: any; // GlyphplotWebglComponent or GlyplotComponent
  private context: any;
  private _animationIntervalId: number;
  private _animationProgress = 0;

  private _start: Point = { x: -1, y: -1 };
  private _end: Point = { x: -1, y: -1 };
  private _offset: any = { x: 0, y: 0 };

  //webgl pulse effect
  private _dotGlyph: Glyph;

  // x, y are standardized 0..1
  static applyEasing(x: number): number {
    const a = 1.25; // steepness of ease-in-out, 1 is linear
    return Math.pow(x, a) / (Math.pow(x, a) + Math.pow((1 - x), a));
  }

  static animationTick(component: SelectionRect): any {
    return () => {
      component.increaseAnimationProgress();
      component.onTicked();
    }
  }

  public onTicked(): void {
    this.drawHighlightedGlyph();
  }

  constructor(component: any, context: any, helper: any) {
    this.context = context;
    this.component = component;
  }

  public draw(event: any): void {
    if (!arguments.length) { return; }
    if (event.type !== 'zoom') { return; }

    this.clear();
    this.context.save();

    this.context.lineWidth = 1;
    this.context.setLineDash([4, 2]);
    this.context.strokeStyle = 'rgba(48, 48, 48, .73)';

    const w = event.sourceEvent.offsetX - this.start.x;
    const h = event.sourceEvent.offsetY - this.start.y;

    this.end.x = this.start.x + w;
    this.end.y = this.start.y + h;

    this.context.strokeRect(this.start.x + this.offset.x, this.start.y + this.offset.y, w, h);

    this.context.restore();
  }

  public drawWebGl(event: InteractionEventData): void {
    if (!arguments.length) { return; }

    this.clear();
    this.context.save();
    this.context.lineWidth = 1;
    this.context.setLineDash([4, 2]);
    this.context.strokeStyle = 'rgba(48, 48, 48, .73)';

    const w = event.GetPositionX() - this.start.x;
    const h = event.GetPositionY() - this.start.y;

    this.end.x = this.start.x + w;
    this.end.y = this.start.y + h;

    this.context.strokeRect(this.start.x + this.offset.x, this.start.y + this.offset.y, w, h);

    this.context.restore();
  }

  public clear() {
    this.context.save();
    this.context.clearRect(
      this.offset.x,
      this.offset.y,
      this.component.width,
      this.component.height);
    this.context.restore();
  }

  public increaseAnimationProgress() {
    this._animationProgress += 0.01;
    if (this._animationProgress > 1) {
      this._animationProgress = 0;
    }
  }

  public drawHighlightedGlyph() {
    if (this.component.regionManager.IsD3Active() == false) {
      // draw highlighted glyph when webgl is active
      this.clear();
      this.context.save();
      //use existing pulse effect
      const idOfHoveredGlyph = this.component.configuration.idOfHoveredGlyph;
      if (idOfHoveredGlyph !== undefined && idOfHoveredGlyph !== -1) {
        let hoveredGlyph;
        for (const glyph of this.component.data.positions) {
          if (glyph.id === idOfHoveredGlyph) {
            hoveredGlyph = glyph;
            break;
          }
        }
        const positions = {
          x: hoveredGlyph.position.x + (this.offset.x),
          y: hoveredGlyph.position.y + (this.offset.y)
        };

        var featuresOfHoveredGlyph = this.component.configuration.getFeaturesForItem(hoveredGlyph, this.component.configuration);

        const colorScale = item => {
          return item === undefined
            ? 0
            : this.component.configuration.color(+item[this.component.data.schema.color]);
        };
        if (this._dotGlyph == undefined) {
          this._dotGlyph = new DotGlyph(this.context, colorScale, new DotGlyphConfiguration());
        }

        var position: { x: number, y: number } = positions;
        this._dotGlyph.draw(position,
          featuresOfHoveredGlyph.features,
          null,
          false,
          true,
          SelectionRect.applyEasing(this._animationProgress));

        this.context.restore();

        if (this._animationIntervalId === undefined || this._animationIntervalId === null) {
          this._animationIntervalId = window.setInterval(SelectionRect.animationTick(this), 10);
        } else {
          if (this._animationProgress >= 1) {
            this._animationProgress = 0;
          }
        }
      } else if (this._animationIntervalId !== undefined && this._animationIntervalId !== null) {
        clearInterval(this._animationIntervalId);
        this._animationIntervalId = undefined;
        this._animationProgress = 0;
      }
    }

    if (this.component.configuration.showHighlightInNormalMode || this.component.configuration.useDragSelection) {
      // draw highlighted glyph
      const idOfHoveredGlyph = this.component.configuration.idOfHoveredGlyph;
      if (idOfHoveredGlyph !== undefined && idOfHoveredGlyph !== -1) {
        let hoveredGlyph;
        for (const glyph of this.component.data.positions) {
          if (glyph.id === idOfHoveredGlyph) {
            hoveredGlyph = glyph;
            break;
          }
        }

        if (this.component.regionManager.IsD3Active() == true) {
          this.clear();
          this.context.save();
          const featuresOfHoveredGlyph = this.component.configuration.getFeaturesForItem(hoveredGlyph);
          this.component.circle.context = this.context;
          this.component.configuration.glyph.context = this.context;
          const positions = {
            x: hoveredGlyph.position.x + (this.offset.x),
            y: hoveredGlyph.position.y + (this.offset.y)
          };
          this.component.layoutController.drawSingleGlyph(
            positions,
            featuresOfHoveredGlyph.features,
            null,
            false,
            true,
            SelectionRect.applyEasing(this._animationProgress));
          this.context.restore();
          this.component.circle.context = this.component.context;
          this.component.configuration.glyph.context = this.component.context;
        }

        if (this._animationIntervalId === undefined || this._animationIntervalId === null) {
          this._animationIntervalId = window.setInterval(SelectionRect.animationTick(this), 10);
        } else {
          if (this._animationProgress >= 1) {
            this._animationProgress = 0;
          }
        }
      } else if (this._animationIntervalId !== undefined && this._animationIntervalId !== null) {
        clearInterval(this._animationIntervalId);
        this._animationIntervalId = undefined;
        this._animationProgress = 0;
      }
    }
  }


  //#region Getters and Setters
  public get start(): any { return this._start; }
  public set start(start: any) {
    this._start = start;
  }

  public get end(): any { return this._end; }
  public set end(end: any) {
    this._end = end;
  }

  public get offset(): any { return this._offset; }
  public set offset(value: any) {
    this._offset = value;
    this.context.canvas.height = window.innerHeight;
    this.context.canvas.width = window.innerWidth;
  }

 //#endregion
}
