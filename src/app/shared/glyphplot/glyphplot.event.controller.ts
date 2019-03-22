import { GlyphplotComponent } from './glyphplot.component';
import { ConfigurationData } from './configuration.data';
import { LenseCursor } from './../lense/cursor.service';
import { Logger } from './../../logger.service';
import { IdFilter } from '../id-filter';
import { FeatureFilter } from '../feature-filter';
import { Configuration } from './configuration.service';

import * as d3 from 'd3';
import { FlowerGlyph } from '../glyph/glyph.flower';
import { StarGlyph } from '../glyph/glyph.star';
import { EventAggregatorService } from '../events/event-aggregator.service';
import { RefreshPlotEvent } from '../events/refresh-plot.event';
import { FitToScreenEvent } from '../events/fit-to-screen.event';
import { FitToSelectionEvent } from '../events/fit-to-selection.event';
import { ManualZoom } from '../events/manual-zoom.event';
import { TransitiveCompileNgModuleMetadata } from '@angular/compiler';
import { truncate } from 'fs';
import { GlyphLayout } from '../glyph/glyph.layout';
import { RefreshHoverEvent } from '../events/refresh-hover.event';
import { RefreshHoverEventData } from '../events/refresh-hover.event.data';

export class GlyphplotEventController {
  private counter: number;
  private saveEndTransform = { x: 0, y: 0 };
  private saveStartTransform = { x: 0, y: 0 };
  private formerTranslation = { x: 0, y: 0 };
  private selectionEnded: boolean;
  private currentEventType: string;

  constructor(private component: GlyphplotComponent,
    private configuration: ConfigurationData,
    private cursor: LenseCursor,
    private logger: Logger,
    private configurationService: Configuration,
    private eventAggregator: EventAggregatorService
  ) {
    this.eventAggregator
      .getEvent(RefreshPlotEvent)
      .subscribe(this.onRefreshPlot);
    this.eventAggregator
      .getEvent(FitToScreenEvent)
      .subscribe(this.fitToScreen);
    this.eventAggregator
      .getEvent(FitToSelectionEvent)
      .subscribe(this.fitToSelection);
    this.eventAggregator
      .getEvent(ManualZoom)
      .subscribe(this.manualZoom);
    this.eventAggregator
      .getEvent(RefreshHoverEvent)
      .subscribe(this.onRefreshHover);
  }

  /**
   * When the mousewheel is rotated on the canvas, update the transform of the viewport by updating
   * glyph posititions according to the new transform.
   */
  public onZoomed(): void {
    if (this.component.drawLock) { return; }
    if (d3.event.sourceEvent === null) { return; }

    // save eventType for use in onDragEnd
    this.currentEventType = d3.event.sourceEvent.type;

    this.component.simulation.stop();

    // apply transformation only, if event was a scroll or if we are not using DragSelection
    if (d3.event && (d3.event.sourceEvent.type === 'wheel' || !this.configuration.useDragSelection)) {
      const trans = d3.event.transform;
      trans.x = this.saveStartTransform.x + d3.event.transform.x - this.saveEndTransform.x;
      trans.y = this.saveStartTransform.y + d3.event.transform.y - this.saveEndTransform.y;
      this.component.configuration.zoomIdentity = trans;
      this.formerTranslation.x = this.component.configuration.zoomIdentity.x / this.component.configuration.zoomIdentity.k;
      this.formerTranslation.y = this.component.configuration.zoomIdentity.y / this.component.configuration.zoomIdentity.k;
      this.selectionEnded = true;
      this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
      this.configuration.currentLayout = GlyphLayout.Cluster;
    }

    if (!d3.event.sourceEvent) { return; }

    // Prevent event overkill by only using every 15th touch event
    if (d3.event.sourceEvent.type === 'touchmove') {
      this.counter++;
      if (this.counter % 15 !== 0) { return; }
    }

    // Draw selection rectangle
    if (this.configuration.useDragSelection) {
      this.component.selectionRect.draw(d3.event);
      return;
    }

    if (d3.event.sourceEvent.type === 'touchmove' || d3.event.sourceEvent.type === 'mousemove') {
      if (this.configuration.currentLayout === GlyphLayout.Matrix
        && !this.configuration.useDragSelection) {
        this.component.animate();
      } else {
        this.component.updateGlyphLayout();
        this.component.draw();
      }
    } else {
      this.component.animate();
    }
  }

  /**
   * When a new drag event is started, stop the collision simulation and set the starting values of
   * the selection rect depending on whats set in the current configuration.
   */
  public onDragStart(): void {
    if (this.selectionEnded) {
      this.saveStartTransform = d3.event.transform;
    }

    this.counter = 0;
    this.component.simulation.stop();

    if (!this.configuration.useDragSelection) {
      this.configuration.currentLayout = GlyphLayout.Cluster;
      return;
    }

    if (!d3.event.sourceEvent) { return; }

    this.selectionEnded = false;
    const startX: number = d3.event.sourceEvent.offsetX;
    const startY: number = d3.event.sourceEvent.offsetY;
    this.component.selectionRect.start = { x: startX, y: startY };
  }

  /**
   * Dragging the canvas ended, so update collisions and get a a list of selected glyphs.
   */
  public onDragEnd(): void {
    this.saveEndTransform = d3.event.transform;

    // prevent selection if event was zoom (eventType is something like wheel)
    if (!this.configuration.useDragSelection || this.currentEventType !== 'mousemove') {
      this.currentEventType = null;
      return;
    }
    this.currentEventType = null;

    const existingIdFilters: FeatureFilter[] = this.configuration.featureFilters.filter((filter: FeatureFilter) => {
      if (filter instanceof IdFilter) {
        return true;
      }
    });

    const selection = this.component.selectionRect.selectedGlyphs;
    const selectedIds: number[] = selection.positions.reduce((arrayOfIds: number[], item: any) => {
      arrayOfIds.push(item.id);
      return arrayOfIds;
    }, []);

    this.clearIdFilters();

    // filter only if at least one glyph was selected
    if (selectedIds.length > 0) {
      let idFilter: IdFilter;

      if (this.configuration.extendSelection && existingIdFilters.length > 0) {
        const existingFilter = existingIdFilters[0];
        if (existingFilter instanceof IdFilter) {
          idFilter = existingFilter;
        }
        idFilter.extendAccaptableIds(selectedIds);
      } else {
        idFilter = new IdFilter('id', selectedIds);
      }
      if (this.viewsShowTheSameDataSet()) {
        this.configurationService.configurations[0].featureFilters.push(idFilter);
        this.configurationService.configurations[1].featureFilters.push(idFilter);
        this.configurationService.configurations[0].filterRefresh();
        this.configurationService.configurations[1].filterRefresh();
      } else {
        this.configuration.featureFilters.push(idFilter);
        this.configuration.filterRefresh();
      }
    }
    // draws the selection rectangle if the user is currently in the specific mode
    if (
      this.configuration.useDragSelection &&
      d3.event
    ) {
      this.component.selectionRect.draw(d3.event);
    }
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  private viewsShowTheSameDataSet(): boolean {
    return this.configurationService.configurations[0].selectedDataSetInfo.name ===
      this.configurationService.configurations[1].selectedDataSetInfo.name;
  }

  private clearIdFilters() {
    function removeIdFilters(filter: FeatureFilter, index: number, featureFilters: FeatureFilter[]) {
      if (filter instanceof IdFilter) {
        featureFilters.splice(index, 1);
      }
    }

    // remove old idFilters
    if (this.viewsShowTheSameDataSet()) {
      this.configurationService.configurations[0].featureFilters.forEach(removeIdFilters);
      this.configurationService.configurations[1].featureFilters.forEach(removeIdFilters);
    } else {
      this.configuration.featureFilters.forEach(removeIdFilters);
    }
  }

  /**
   * Whenever the force layout simulation 'ticks', redraw the glyphs to their updated positions.
   */
  public onTicked(): void {
    this.component.draw();
  }

  /**
   * Handle keypress events, which are mainly used for debugging purposes.
   * @param e [description]
   */
  public onKeyPress(e: KeyboardEvent): void {
    switch (e.key.toLowerCase()) {
      case 'shift': {
        let extendSelection: boolean;

        if (e.type === 'keydown') {
          extendSelection = true;
          if (this.configuration.useDragSelection) {
            d3.select('canvas:hover').style('cursor', 'copy');
          }
        } else if (e.type === 'keyup') {
          extendSelection = false;
          if (this.configuration.useDragSelection) {
            d3.select('canvas:hover').style('cursor', 'crosshair');
          } else {
            d3.select('canvas:hover').style('cursor', 'default');
          }
        }

        this.configuration.extendSelection = extendSelection;
        break;
      }
    }
  }


  /**
   * If the mouse cursors moves, update the tooltip for glyphs if needed.
   * @param e mouse move event
   */
  public onMouseMove(e: MouseEvent): void {
    if (this.cursor.isVisible && !this.cursor.isFixed) {
      this.cursor.position = { left: e.clientX, top: e.clientY };
      this.component.tooltip.isVisible = false;
    } else if (!this.component.tooltip.isFixed && !this.configuration.useDragSelection) {
      this.component.tooltip.updateClosestPoint(e, this.component.configuration.zoomIdentity);
    } else if (!this.component.tooltip.isFixed) {
      this.component.tooltip.isVisible = false;
    }
    if (!this.cursor.isVisible) {
      // find glyph to highlight
      let glyphRadius: number;
      if (this.configuration.currentLevelOfDetail === 0) {
        glyphRadius = 5;
      } else {
        const glyphConfiguration = this.configuration.glyph;
        if (glyphConfiguration instanceof FlowerGlyph || glyphConfiguration instanceof StarGlyph) {
          glyphRadius = glyphConfiguration.configuration.radius;
        }
      }
      if (this.configurationService.configurations[0].selectedDataSetInfo.name ===
        this.configurationService.configurations[1].selectedDataSetInfo.name) {
        this.configurationService.configurations[0].idOfHoveredGlyph = undefined;
        this.configurationService.configurations[1].idOfHoveredGlyph = undefined;
      } else {
        this.configuration.idOfHoveredGlyph = undefined;
      }
      for (const element of this.component.data.positions) {
        if (
          Math.abs(element.position.x - e.layerX) <= glyphRadius &&
          Math.abs(element.position.y - e.layerY) <= glyphRadius
        ) {
          if (this.configurationService.configurations[0].selectedDataSetInfo.name ===
            this.configurationService.configurations[1].selectedDataSetInfo.name) {
            this.configurationService.configurations[0].idOfHoveredGlyph = element.id;
            this.configurationService.configurations[1].idOfHoveredGlyph = element.id;
          } else {
            this.configuration.idOfHoveredGlyph = element.id;
          }
          break;
        }
      }
      if (this.configuration.useDragSelection) {
        this.component.draw();
      }
    }
  }

  /**
   * If the canvas is clicked, either fixate the tooltip in its position or make it movable again.
   * @param e mouse click event
   */
  public onClick(e: MouseEvent): void {
    if (e.target !== this.component.context.canvas) {
      return;
    }
    if (this.component.tooltip.isVisible && !this.component.tooltip.isFixed) {
      this.component.tooltip.isFixed = true;
    } else if (!this.component.tooltip.isEdit) {
      this.component.tooltip.isFixed = false;
    }
    if (this.configuration.useDragSelection && !this.configuration.extendSelection) {
      this.clearIdFilters();
      this.component.draw();
    }
  }

  private updateSelectionMode(useDragSelection: boolean) {
    if (this.component.data === null) {
      return;
    }

    const element = this.component.chartContainer.nativeElement;

    if (useDragSelection) {
      if (this.configuration.extendSelection) {
        d3.select(element).style('cursor', 'copy');
      } else {
        d3.select(element).style('cursor', 'crosshair');
      }
    } else {
      d3.select(element).style('cursor', 'default');

      // remove highlight
      if (this.configurationService.configurations[0].selectedDataSetInfo.name ===
        this.configurationService.configurations[1].selectedDataSetInfo.name) {
        this.configurationService.configurations[0].idOfHoveredGlyph = undefined;
        this.configurationService.configurations[1].idOfHoveredGlyph = undefined;
      } else {
        this.configuration.idOfHoveredGlyph = undefined;
      }
    }
  }

  private onRefreshPlot = (payload: boolean) => {
    if (this.component.data === null) {
      return;
    }

    // Calculate Colors for Glyphs new ...
    const colorFeature = this.component.data.schema.color;
    const colorScale = item => {
      return item === undefined
        ? 0
        : this.configuration.color(+item[colorFeature]);
    };

    this.configuration.glyph.color = colorScale;
    this.component.circle.color = colorScale;
    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.updateSelectionMode(this.configuration.useDragSelection);
    this.component.updateGlyphLayout(true);
    this.component.draw();
  };

  private fitToScreen = (payload: boolean) => {
    this.component.configuration.zoomIdentity.x = 0;
    this.component.configuration.zoomIdentity.y = 0;
    this.component.configuration.zoomIdentity.k = 1;
    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.component.updateGlyphLayout(true);
    this.component.animate();
    this.formerTranslation = {x: 0, y: 0};
  };

  public fitToSelection(id: string): void {
    if (id != this.component.uniqueID) {
      return;
    }
    const that = this;
    var filteredPositions = [];
    this.component.layoutController.getPositions().forEach(d => {
      const data = this.component.layoutController.getFeaturesForItem(d);

        if (that.configuration.filteredItemsIds.indexOf(d.id) > -1 || this.configuration.featureFilters.length === 0) {
          filteredPositions.push(d.position);
        }
      });
    if (filteredPositions.length === this.component.layoutController.getPositions().length || filteredPositions.length === 0) {
      return;
    }
    let minX, maxX, minY, maxY: number;
    this.component.configuration.zoomIdentity.k = 1;
    this.component.configuration.zoomIdentity.x = 0;
    this.component.configuration.zoomIdentity.y = 0;
    minX = this.component.configuration.zoomIdentity.applyX(this.component.xAxis(filteredPositions[0].ox));
    maxX = minX;
    minY = this.component.configuration.zoomIdentity.applyY(this.component.yAxis(filteredPositions[0].oy));
    maxY = minY;
    let k: number;
    filteredPositions.forEach( d => {
        var ox = this.component.configuration.zoomIdentity.applyX(this.component.xAxis(d.ox));
        var oy = this.component.configuration.zoomIdentity.applyY(this.component.yAxis(d.oy))
        if (ox < minX) {
          minX = ox;
        }
        if (ox > maxX) {
          maxX = ox;
        }
        if (oy < minY) {
          minY = oy;
        }
        if (oy > maxY) {
          maxY = oy;
        }
    });
    if (maxX == minX || maxY == minY) {
      k = 8;
    } else {
      if ((this.component.width / this.component.height) * (maxY - minY) < (maxX - minX)) {
        k = this.component.width / ((maxX - minX) * 1.1);
      } else {
        k = this.component.height / ((maxY - minY) * 1.1);
      }
      if (k > 8) {
        k = 8;
      }
    }
    this.component.configuration.zoomIdentity.k = k;
    this.component.configuration.zoomIdentity.x = (this.component.width - this.component.width * k) / 2 + (this.component.width / 2 - (maxX + minX) / 2) * k;
    this.component.configuration.zoomIdentity.y =
      (this.component.height - this.component.height * k) / 2 +
      (this.component.height / 2 - (maxY + minY) / 2) * k;
    this.formerTranslation.x = this.component.configuration.zoomIdentity.x;
    this.formerTranslation.y = this.component.configuration.zoomIdentity.y;

    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.component.animate();

  };

  private manualZoom = (payload: number) => {

    this.component.configuration.zoomIdentity.x = (this.component.width - this.component.width * payload) / 2 + this.formerTranslation.x * payload;
    this.component.configuration.zoomIdentity.y = (this.component.height - this.component.height * payload) / 2 + this.formerTranslation.y * payload;
    this.component.configuration.zoomIdentity.k = payload;
    this.component.updateGlyphLayout();
    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.component.animate();
  };

  private onRefreshHover = (payload: RefreshHoverEventData) => {
    this.component.draw();
    if (this.configuration.useDragSelection) {
      this.component.selectionRect.drawHighlightedGlyph();
    }
  };
};
