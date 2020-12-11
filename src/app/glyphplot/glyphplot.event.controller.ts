import { GlyphplotComponent } from './glyphplot.component';
import { ConfigurationData } from '../shared/services/configuration.data';
import { LenseCursor } from './../lense/cursor.service';
import { SelectionService} from 'src/app/shared/services/selection.service'
import { RefreshSelectionEvent } from 'src/app/shared/events/refresh-selection.event';

import { ViewportTransformationEventData } from 'src/app/shared/events/viewport-transformation.event.data';
import { UpdateItemsStrategy } from 'src/app/shared/util/UpdateItemsStrategy';
import { ViewportTransformationEvent } from 'src/app/shared/events/viewport-transformation.event';
import { RegionManager } from 'src/app/region/region.manager';
import * as THREE from 'three';
import { VisualizationType, SwitchVisualizationEvent } from 'src/app/shared/events/switch-visualization.event';
import { Logger } from 'src/app/shared/services/logger.service';
import { IdFilter } from 'src/app/shared/filter/id-filter';
import { FeatureFilter } from 'src/app/shared/filter/feature-filter';
import { Configuration } from '../shared/services/configuration.service';

import * as d3 from 'd3';
import { FlowerGlyph } from 'src/app/glyph/glyph.flower';
import { StarGlyph } from 'src/app/glyph/glyph.star';
import { EventAggregatorService } from 'src/app/shared/events/event-aggregator.service';
import { RefreshPlotEvent } from 'src/app/shared/events/refresh-plot.event';
import { FitToScreenEvent } from 'src/app/shared/events/fit-to-screen.event';
import { FitToSelectionEvent } from 'src/app/shared/events/fit-to-selection.event';
import { ManualZoom } from 'src/app/shared/events/manual-zoom.event';
import { GlyphLayout } from 'src/app/glyph/glyph.layout';
import { RefreshHoverEvent } from 'src/app/shared/events/refresh-hover.event';
import { RefreshHoverEventData } from 'src/app/shared/events/refresh-hover.event.data';

export class GlyphplotEventController {
  private counter: number = 0;
  private saveEndTransform = { x: 0, y: 0 };
  private saveStartTransform = { x: 0, y: 0 };
  private formerTranslation = { x: 0, y: 0 };
  private _component: GlyphplotComponent | null = null;
  private selectionEnded: boolean = false;
  private currentEventType: string = "";

  constructor(private component: GlyphplotComponent,
    private configuration: ConfigurationData,
    private cursor: LenseCursor,
    private logger: Logger,
    private configurationService: Configuration,
    private eventAggregator: EventAggregatorService,
    private selectionService: SelectionService
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
    this.eventAggregator
      .getEvent(ViewportTransformationEvent)
      .subscribe(this.onViewportTransformationUpdated);
  }


  private onViewportTransformationUpdated = (payload: ViewportTransformationEventData) => {
    this.component.transform.x = payload.GetScale() * (-payload.GetTranslateX() - payload.GetZoomViewportOffsetX() - payload.GetZoomCursorOffsetX());
    this.component.transform.y = payload.GetScale() * (-payload.GetTranslateY() - payload.GetZoomViewportOffsetY() - payload.GetZoomCursorOffsetY());
    this.component.transform.k = payload.GetScale();

    this.formerTranslation.x = this.component.transform.x;
    this.formerTranslation.y = this.component.transform.y;

    if (!this.component.regionManager.IsD3Active()) {
      return;
    }

    this.configuration.updateCurrentLevelOfDetail(this.component.transform.k);

    if (payload.GetUpdateStrategy() === UpdateItemsStrategy.DefaultUpdate) {
      this.component.updateGlyphLayout();
    } else if (payload.GetUpdateStrategy() === UpdateItemsStrategy.CompleteRefresh) {
      this.component.updateGlyphLayout(true);
    }

    this.component.animate();
  }

   /**
   * When the mousewheel is rotated on the canvas, update the transform of the viewport by updating
   * glyph posititions according to the new transform.
   */
  public onZoomed(event: any): void {
    if (this.component.drawLock) { return; }
    if (event.sourceEvent === null) { return; }

    // save eventType for use in onDragEnd
    this.currentEventType = event.sourceEvent.type;

    this.component.simulation.stop();

    // apply transformation only, if event was a scroll or if we are not using DragSelection
    if (event && (event.sourceEvent.type === 'wheel' || !this.configuration.useDragSelection)) {
      const trans = event.transform;
      trans.x = this.saveStartTransform.x + event.transform.x - this.saveEndTransform.x;
      trans.y = this.saveStartTransform.y + event.transform.y - this.saveEndTransform.y;
      this.component.configuration.zoomIdentity = trans;
      this.formerTranslation.x = this.component.configuration.zoomIdentity.x / this.component.configuration.zoomIdentity.k;
      this.formerTranslation.y = this.component.configuration.zoomIdentity.y / this.component.configuration.zoomIdentity.k;

      // TODO: Coherent switch to ThreeJS mode?

      this.selectionEnded = true;

      const normMouseX = -0.5;
      const normMouseY = -0.5;

      this.configuration.currentLayout = GlyphLayout.Cluster;

      const offsets = this.component.cameraUtil!.ComputeZoomOffset(trans.k, new THREE.Vector2(normMouseX, normMouseY));

      const transformArgs = new ViewportTransformationEventData(
        -trans.x / trans.k + offsets.CursorOffset.x,
        -trans.y / trans.k + offsets.CursorOffset.y,
        0,
        trans.k, UpdateItemsStrategy.DefaultUpdate,
        offsets.ViewportScaleOffset.x,
        offsets.ViewportScaleOffset.y, 0,
        0,
        0, 0);
      this.eventAggregator.getEvent(ViewportTransformationEvent).publish(transformArgs);
    }

    if (!event.sourceEvent) { return; }

    // Prevent event overkill by only using every 15th touch event
    if (event.sourceEvent.type === 'touchmove') {
      this.counter++;
      if (this.counter % 15 !== 0) { return; }
    }

    // Draw selection rectangle
    if (this.configuration.useDragSelection) {
      this.component.selectionRect.draw(event);
      return;
    }

    if (event.sourceEvent.type === 'touchmove' || event.sourceEvent.type === 'mousemove') {
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
  public onDragStart(event: any): void {
    if (this.selectionEnded) {
      this.saveStartTransform = event.transform;
    }

    this.counter = 0;
    this.component.simulation.stop();

    if (!this.configuration.useDragSelection) {
      this.configuration.currentLayout = GlyphLayout.Cluster;
      return;
    }

    if (!event.sourceEvent) { return; }

    this.selectionEnded = false;
    const startX: number = event.sourceEvent.offsetX;
    const startY: number = event.sourceEvent.offsetY;
    this.component.selectionRect.start = { x: startX, y: startY };
  }

  /**
   * Dragging the canvas ended, so update collisions and get a a list of selected glyphs.
   */
  public onDragEnd(event: any): void {
    this.saveEndTransform = event.transform;

    // prevent selection if event was zoom (eventType is something like wheel)
    if (!this.configuration.useDragSelection || this.currentEventType !== 'mousemove') {
      this.currentEventType = "";
      return;
    }
    this.currentEventType = "";

    const existingIdFilters: FeatureFilter[] = this.selectionService.featureFilters.filter((filter: FeatureFilter) => {
      if (filter instanceof IdFilter) {
        return true;
      }
      return false;
    });

    this.selectionService.data = this.component.data;
    this.selectionService.selectByArea(this.component.selectionRect.start, this.component.selectionRect.end);
    const selectedIds = this.selectionService.selectedItemsIds;

    this.clearIdFilters();

    // filter only if at least one glyph was selected
    if (selectedIds.length > 0) {
      let idFilter: IdFilter = new IdFilter;

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
        this.selectionService.featureFilters.push(idFilter);
        this.selectionService.filterRefresh();
      } else {
        this.selectionService.featureFilters.push(idFilter);
        this.selectionService.filterRefresh();
      }
    } else {
      this.selectionService.featureFilters = [];
      this.selectionService.filterRefresh();
    }

    // draws the selection rectangle if the user is currently in the specific mode
    if (
      this.configuration.useDragSelection &&
      event
    ) {
      this.component.selectionRect.draw(event);
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
      this.selectionService.featureFilters.forEach(removeIdFilters);
      this.selectionService.featureFilters.forEach(removeIdFilters);
    } else {
      this.selectionService.featureFilters.forEach(removeIdFilters);
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
        let extendSelection: boolean = false;

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
    if (this.cursor.isVisible && !this.cursor.isFixed && this.component.tooltip !== undefined) {
      this.cursor.position = { left: e.clientX, top: e.clientY };
      this.component.tooltip.isVisible = false;
    } else if (this.component.tooltip !== undefined && !this.component.tooltip.isFixed && !this.configuration.useDragSelection) {
      this.component.tooltip.updateClosestPoint(e, this.component.configuration.zoomIdentity);
    } else if (this.component.tooltip !== undefined && !this.component.tooltip.isFixed) {
      this.component.tooltip.isVisible = false;
    }

    if (!this.cursor.isVisible || this.cursor.isFixed ) {
      // find glyph to highlight
      let glyphRadius: number = 1;
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
        this.configurationService.configurations[0].idOfHoveredGlyph = 0;
        this.configurationService.configurations[1].idOfHoveredGlyph = 0;
      } else {
        this.configuration.idOfHoveredGlyph = 0;
      }

      for (const element of this.component.data.positions) {
        if (
          Math.abs(element.position.x - e.clientX) <= glyphRadius &&
          Math.abs(element.position.y - e.clientY) <= glyphRadius
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
    if (this.component.tooltip!.isVisible && !this.component.tooltip!.isFixed) {
      this.component.tooltip!.isFixed = true;
    } else if (!this.component.tooltip!.isEdit) {
      this.component.tooltip!.isFixed = false;
    }
    if (this.configuration.useDragSelection && !this.configuration.extendSelection) {
      this.clearIdFilters();
      this.selectionService.featureFilters = [];
      this.selectionService.filterRefresh();
      this.component.draw();
    }
  }

  private updateSelectionMode(useDragSelection: boolean) {
    if (this.component.data === null) {
      return;
    }

    const element = this.component.chartContainer!.nativeElement;

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
        this.configurationService.configurations[0].idOfHoveredGlyph = 0;
        this.configurationService.configurations[1].idOfHoveredGlyph = 0;
      } else {
        this.configuration.idOfHoveredGlyph = 0;
      }
    }
  }

  private onRefreshPlot = (payload: boolean) => {
    if (this.component.data === null) {
      return;
    }

    // Calculate Colors for Glyphs new ...
    const colorFeature = this.component.data.schema.color;
    const colorScale = (item: any) => {
      return item === undefined
        ? 0
        : this.configuration.color(+item[colorFeature]);
    };

    this.configuration.glyph!.color = colorScale;
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
    this.formerTranslation = {x: 0, y: 0};
    const args = new ViewportTransformationEventData(0, 0, 0, 1, UpdateItemsStrategy.CompleteRefresh);
    this.eventAggregator.getEvent(ViewportTransformationEvent).publish(args);
  };

  public fitToSelection = (payload: string) => {
    if (this.component == null){
      return
    }
    if (payload != this.component.uniqueID ) {
      return;
    }
    const that = this;
    const filteredPositions: any[] = [];
    this.component.layoutController.getPositions().forEach((d: any) => {
      const data = that.component.configuration.getFeaturesForItem(d);

        if (that.selectionService.filteredItemsIds.indexOf(d.id) > -1 || this.selectionService.featureFilters.length === 0) {
          filteredPositions.push(d.position);
        }
      });
    if (filteredPositions.length === this.component.layoutController.getPositions().length || filteredPositions.length === 0) {
      return;
    }
    let minX: number, maxX: number, minY: number, maxY: number;
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

    if (Math.abs(k) < 0.01) {
      return;
    }

    // TODO: Coherent switch to ThreeJS mode?

    const args = new ViewportTransformationEventData(minX, minY, 0, k, UpdateItemsStrategy.DefaultUpdate);

    this.eventAggregator.getEvent(ViewportTransformationEvent).publish(args);

  };

  private manualZoom = (zoomFactor: number) => {

    const transX = (this.component.width - this.component.width) / 2 + this.formerTranslation.x;
    const transY = (this.component.height - this.component.height) / 2 + this.formerTranslation.y;

    const args = new ViewportTransformationEventData(transX, transY, 0, zoomFactor, UpdateItemsStrategy.DefaultUpdate);

    this.eventAggregator.getEvent(ViewportTransformationEvent).publish(args);
  };

  private onRefreshHover = (payload: RefreshHoverEventData) => {   
    this.component.draw();
    if (this.configuration === undefined) {
      return;
    }

    if (this.configuration.useDragSelection) {
      this.component.selectionRect.drawHighlightedGlyph();
    }
  };
};
