import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { DataproviderService } from '../../dataprovider.service';
import { Configuration } from '../glyphplot/configuration.service';
import { Glyph } from '../glyph/glyph';
import { FlowerGlyph } from '../glyph/glyph.flower';
import { GlyphConfiguration } from '../glyph/glyph.configuration';
import { StarGlyph } from '../glyph/glyph.star';
import { LenseCursor } from './cursor.service';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { Logger } from '../../logger.service';
import { Helper } from '../glyph/glyph.helper';

import * as d3 from 'd3';
import { FlowerGlyphConfiguration } from '../glyph/glyph.flower.configuration';
import { StarGlyphConfiguration } from '../glyph/glyph.star.configuration';
import { GlyphType } from '../glyph/glyph.type';
import { FeatureFilter } from '../feature-filter';

@Component({
  selector: 'app-lense',
  templateUrl: './lense.component.html',
  styleUrls: ['./lense.component.css']
})

export class MagicLenseComponent implements OnInit {
  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('secondary') splitCanvas: ElementRef;
  @ViewChild('tooltip') public tooltip: TooltipComponent;

  private data: any; // primary dataset for position, feature and schema data
  private dataSecondary: any; // secondary dataset

  private visible: [any]; // array of visible position objects in primary dataset
  private visibleSecondary: any; // array of visible position objects in secondary dataset

  public cursorWidth = 50;
  public cursorHeight = 50;

  private lensDiameter = 300;
  private width: number = window.innerWidth;
  private height: number = window.innerHeight;

  private context: any; // 2D context for canvas
  private splitContext: any; // 2D context for canvas of split lens
  private flowerGlyph: FlowerGlyph;
  private starGlyph: StarGlyph;
  private activeGlyph: Glyph;
  private activeConfig: GlyphConfiguration;

  private simulation: any; // force for visible
  private secondarySimulation: any;
  private secondarySimulationActive = true;

  /**
   * Static function called by collision simulations at every 'tick' event. Updates the positions
   * of visible glyphs and redraws them on the canvas.
   * @param  {MagicLenseComponent} component the component the simulations 'ticks' in
   * @return {void}
   */
  static ticked(component: MagicLenseComponent) {
    // if neither dataset is set yet (data provider is async), do nothing
    if (component.data == null && component.dataSecondary == null) { return; }

    // TODO: Only draw lense if actual update is required (change of position etc.)
    // draw glyphs in 'primary/main' lens
    component.draw(component.context, component.visible, component.data.features, component.configuration.configurations[0], true);
    component.simulation.alpha(1);

    // draw glyphs secondary in secondary lens if split screen is active and data is available
    if (component.dataSecondary != null) {
      component.draw(
        component.splitContext,
        component.visibleSecondary,
        component.dataSecondary.features,
        component.configuration.configurations[1],
        false);
        if (component.secondarySimulationActive) { component.secondarySimulation.alpha(1) };
    }

    // reset the collision simulations for both primary and secondary lenses and update the visible
    // glyphs
    if (component.cursor.updateGlyphs || component.cursor.forceAnimateGlyphs) {
      component.cursor.updateGlyphs = false; // set update flag to false
      component.visibleGlyphs(); // get visible glyphs

      // restart primary simulation
      component.simulation
        .nodes(component.visible.map(item => item.position))
        .restart();

      // restart secondary simulation
      if (component.dataSecondary != null && component.secondarySimulationActive) {
        component.secondarySimulation
          .nodes(component.visibleSecondary.map(item => item.position))
          .restart();
      }
    }
  }

  constructor(
    public cursor: LenseCursor,
    private dataProvider: DataproviderService,
    private logger: Logger,
    private configuration: Configuration,
    private helper: Helper) {}

  ngOnInit() {
    const that = this;

    const accessorScale = d3.scaleLinear().range([0, 100]);

    // add the data for every configured splitscreen (FIXME: only works with two right now)
    this.configuration.configurations.forEach((config, i) => {
      config.getData().subscribe(message => {
        if (!message) { return; } // wait for data

        // first configuration defines glyphs, accessors, colorscheme
        if (i === 0) {
          let maxValue: number; // stores maximum value in accessors (FIXME: needed? max = 1.0)
          const colorFeature = message.schema.color; // the feature that is used for the color
          const colorScale = item => config.color(+item[colorFeature]);
          const accessors = [];

          // set the 'main' dataset
          this.data = message;

          // Extract accessors from schema and max values from features (see glyphplot component)
          this.data.schema.glyph.forEach(feat => {
            maxValue = 0;
            this.data.features.forEach(item => {
              const v: number = +item.features[feat];
              maxValue = (v > maxValue) ? v : maxValue;
            });
            accessorScale.domain([0, maxValue]);
            accessors.push(d => accessorScale(d[feat]));
          });

          // define the glyphs used in both lenses
          this.flowerGlyph = new FlowerGlyph(this.context, colorScale, this.configuration.flowerConfigs[1] as FlowerGlyphConfiguration);
          this.starGlyph = new StarGlyph(this.context, colorScale, this.configuration.starConfigs[1] as StarGlyphConfiguration);

          // start with flowerglyph per default
          this.activeGlyph = this.flowerGlyph;
        } else if (i === 1) {
          // second configuration sets secondary dataset
          this.dataSecondary = message;
        }
      });
    })

    // get context
    this.context = this.canvas.nativeElement.getContext('2d');
    this.splitContext = this.splitCanvas.nativeElement.getContext('2d');
    this.splitContext.canvas.height = this.height;
    this.splitContext.canvas.width = this.width / 2;

    this.simulation = d3.forceSimulation()
      .force('collision', d3.forceCollide().radius(25))
      .on('tick', () => { MagicLenseComponent.ticked(that) });

    this.secondarySimulation = d3.forceSimulation()
      .force('collision', d3.forceCollide().radius(25))
      .on('tick', () => { MagicLenseComponent.ticked(that) });

    this.tooltip.tolerance = 15;
  }

  public onCursorMouseMove(e: any): void {
    if (this.cursor.isFixed) { return; }

    // update the cursor's position since the mousemove event does not pass through the component
    this.cursor.position = { left: e.clientX, top: e.clientY };
    // update visible glyphs based on the new cursor position
    this.visibleGlyphs();

    // set the visible glyphs as input for the force-simulation and restart it
    this.simulation
      .nodes(this.visible.map(item => item.position))
      .restart()
      .alpha(1);

    if (this.secondarySimulationActive) {
      this.secondarySimulation
        .nodes(this.visibleSecondary.map(item => item.position))
        .restart()
        .alpha(1);
    }
  }

  public onLensMouseMove(e: any): void {
    if (this.cursor.isFixed) {
      this.updateTooltip(e);
    }
  }

  public onLensMouseEnter(e: any): void {
    this.tooltip.data = { positions: this.visible, features: this.data.features, schema: this.data.schema };
  }

  public onLensMouseOut(e: any): void {
    this.tooltip.data = this.data;
  }

  public onCursorClick(e: any): void {
    this.cursor.isFixed = !this.cursor.isFixed;
    if (!this.cursor.isFixed) { this.tooltip.isVisible = false; }
  }

  public onWindowResize(e: any): void {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.splitContext.canvas.height = this.height;
    this.splitContext.canvas.width = this.width / 2;
  }

  /**
   * Draws all visible glyphs onto the lens' canvas.
   * @param ctx Canvas2d.Context
   * @return {void}
   */
  private draw(ctx: any, positions: [any], features: [any], config: any, primary_lens: boolean): void {
    if (!this.cursor.isVisible && !this.cursor.display) {
      return; // reduce cpu stress when lens is not visible
    }

    const l = this.lensDiameter; // diameter of the lense
    const scale = 1; // scales the lense's canvas
    let itemContext: number;

    // find out which glyph is currently used by the first GlyphConfiguration (i.e. the one the
    // left glyphplot uses) and use the same glyph for the lens
    switch (this.configuration.activeGlyphType) {
      case GlyphType.Flower:
        this.activeGlyph = this.flowerGlyph;
        this.activeConfig = this.configuration.flowerConfigs[1];
        if (!primary_lens) {
          (this.activeConfig as FlowerGlyphConfiguration).useArea = true;
        }
        break;
      case GlyphType.Star:
        this.activeGlyph = this.starGlyph;
        this.activeConfig = this.configuration.starConfigs[1];
        if (!primary_lens) {
          (this.activeConfig as StarGlyphConfiguration).useCoordinateSystem = true;
          (this.activeConfig as StarGlyphConfiguration).useAbsoluteAxes = true;
        }
        break;
      default:
        return;
    }

    this.activeGlyph.context = ctx;

    ctx.save();
    ctx.clearRect(0, 0, this.width / 2, this.height);
    if (primary_lens) {
    // translate the context's origin to the center of the lense (lensePosition + scaled diameter/2)
      const posX = -this.cursor.position.left * scale + (scale * l) / 2;
      const posY = -this.cursor.position.top * scale + (scale * l) / 2;
      ctx.translate(posX, posY);
      ctx.scale(scale, scale);
    }
    const visible = (this.visible || []); // glyphs selected by the cursor

    const temp: number = this.activeConfig.radius; // store the current radius ...
    this.activeConfig.radius = 25; // ... and set it to a static value

    if (!visible.length) { return; } // nothing to do if no glyphs are inside the cursor

    const visibleIds = this.visible.map(item => item.id);
    const visibleFeatures = features
      .filter(item => visibleIds.indexOf(item.id) !== -1);

    // draw every item in the 'positions' array. Get the features from the visiblefeatures array
    positions.forEach(d => {
      // 'currentFeatures' object with matching id
      const currentFeatures = visibleFeatures.find(item => item.id === d.id);

      ctx.beginPath();

      // draw only if features were found
      if (currentFeatures != null) {
        // context for each item is set individually in the configuration. If no entry for the
        // id exists use the global context. If this is not specified either, use the item's default
        // context
        itemContext = this.configuration.configurations[0].individualFeatureContexts[d.id];

        if (itemContext === undefined) {
          if (this.configuration.configurations[0].globalFeatureContext >= 0) {
            itemContext = this.configuration.configurations[0].globalFeatureContext;
          } else {
            itemContext = currentFeatures['default-context'];
          }
        }

        const feature = currentFeatures.features[itemContext];
        const passive = !((this.configuration.configurations[0].filteredItemsIds.indexOf(d.id) > -1) || (this.configuration.configurations[0].featureFilters.length == 0));

        this.activeGlyph.draw(d.position, feature, undefined, passive);
      }
    });

    this.activeConfig.radius = temp; // reset radius of glyphs to temp
    switch (this.configuration.activeGlyphType) {
      case GlyphType.Flower:
        (this.activeConfig as FlowerGlyphConfiguration).useArea = false;
        break;
      case GlyphType.Star:
        (this.activeConfig as StarGlyphConfiguration).useCoordinateSystem = false;
        (this.activeConfig as StarGlyphConfiguration).useAbsoluteAxes = false;
        break;
    }

    ctx.restore();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Uses the cursor position and width to find all glyphs inside the cursor. Since cursor is
   * radial, also ignores glyphs inside the rectangular bounding box by using the euclidean dist.
   * @return {any[]} [cloned array of visible glyphs, which does not interfere with the orig. data]
   */
  private visibleGlyphs(): any[] {
    const that = this;
    let minX: number = this.cursor.position.left - this.cursorWidth / 2;
    let minY: number = this.cursor.position.top - this.cursorHeight / 2;
    let currentCursorWidth = this.cursorWidth;
    let currentCursorHeight = this.cursorHeight;
    let dx: number;
    let dy: number;

    // helper function that finds objects in positions array that lie inside the cursor
    function visibleFilter(d, i): boolean {
      if (d.position.x > minX &&
          d.position.y > minY &&
          d.position.x < minX + currentCursorWidth &&
          d.position.y < minY + currentCursorHeight) {
        dx = d.position.x - that.cursor.position.left;
        dy = d.position.y - that.cursor.position.top;
        // make sure glyph is inside the circle with euclidean distance
        return Math.sqrt(dx * dx + dy * dy) < that.cursorWidth / 2;
      }
    }

    // Do not overload lens with more than 75 items in large clusters
    let filterResult = this.data.positions.filter(visibleFilter);
    while (filterResult.length > 75) {
      minX += 1;
      minY += 1;
      currentCursorHeight -= 1;
      currentCursorWidth -= 1;
      filterResult = this.data.positions.filter(visibleFilter);
    }

    const visiblePrimary = JSON.parse(JSON.stringify(filterResult));
    const visibleIds = visiblePrimary.map(item => item.id);

    // create a identical copy of all glyphs inside the cursor
    // Only consider secondarydata if the view is split
    if (this.dataSecondary != null) {
      this.visibleSecondary = JSON.parse(
        JSON.stringify(
          this.dataSecondary.positions.filter(item => visibleIds.indexOf(item.id) !== -1)));
    } else {
      this.visibleSecondary = [];
    }

    return this.visible = visiblePrimary;
  }

  private updateTooltip(event: any) {
    this.tooltip.updateClosestPoint({
      'clientX': event.clientX,
      'clientY': event.clientY,
      'offsetX': event.clientX - (this.lensDiameter / 2),
      'offsetY': event.clientY - (this.lensDiameter / 2)
    }, this.context.transform);
    this.tooltip.x = event.clientX + 4;
    this.tooltip.y = event.clientY + 4;
  }
}
