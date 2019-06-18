import { Glyph } from 'app/glyph/glyph';
import { FeatureFilter } from 'app/shared/filter/feature-filter';
import { BehaviorSubject, Observable } from 'rxjs';

import * as d3 from 'd3';
import { GlyphConfiguration } from 'app/glyph/glyph.configuration';
import { Configuration } from './configuration.service';
import { GlyphLayout } from 'app/glyph/glyph.layout';
import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';
import { RefreshHoverEvent } from 'app/shared/events/refresh-hover.event';
import { RefreshHoverEventData } from 'app/shared/events/refresh-hover.event.data';

export class ConfigurationData {
  private configuration: Configuration;
  private eventAggregator: EventAggregatorService;
  
  // categorical color scale, that uses discrete color values on the domain 0-1
  private _categoryColor = d3
    .scaleQuantize()
    .domain([0.0, 1.0])
    .range([
      '#4f366d',
      '#933765',
      '#d08f51',
      '#286367',
      '#8BC34A',
      '#FFC107',
      '#2196F3',
      '#FF5722',
      '#607D8B',
      '#BF3330'
    ] as any);

  // continuous color scale that interpolates the domain 0-1 on two color values
  // Reminder: If you change the colors here, don't forget to change $color-scale-low
  // and $color-scale-high in colors.scss
  private _rangeColor = d3
  .scaleLinear<any, any>()
  .domain([0.0, 0.5, 1.0])
  .range(['#198FBD','#F7D529', '#F7295B']);


  public duration = 1000; // duration of glyph-blossoming animation

  private _levelOfDetails: number[] = [];
  private _maxZoom: number; // greatest magnification of glyphs (i.e. limits zoom.transform.k)
  private _currentLevelOfDetail = 0; // level of detail on current zoom level
  private _previousLevelOfDetail: any; // level of detail on last zoom level
  private _lockLevelOfDetail: boolean;
  private _lockUpdated: boolean;
  private _currentZoomLevel: number;

  private _minScaleLevel = 0.5;

  private _useColorRange = false; // switch between continuous and discrete color scale

  private _featureFilters: FeatureFilter[] = []; // list of filters applied to glyphs

  private _glyph: Glyph; // class of used glyph type (flower, star, dot)
  private _activeFeatures: any[];
  private _featureGroups: any[];
  private _activeDataSet: any; // currently active dataset (schema, features, position)
  private _activeGlyphConfig: GlyphConfiguration; // currently active glyph config
  private _selectedContext: any;
  private _featureContexts = new Array<any>();
  private _selectedFeatureName: string;

  // used to pick value context per item globally and individually (global -1 --> not set)
  private _globalFeatureContext = -1;
  private _individualFeatureContexts: any = {};

  private _useDragSelection = false; // whether or not selection by drag is possible
  private _extendSelection = false; // extend the selection in dragSelection-Mode by pressing 'Shift'
  private _useForceLayout = false; // whether or not glyphs are repositioned with force
  private _layouts: GlyphLayout;
  private _currentLayout = 0;

  private _data = new BehaviorSubject<any>(null);
  private _selectedDataSetInfo = {
    name: '',
    version: '',
    positionAlgorithm: ''
  };
  private _idOfHoveredGlyph = -1;
  private _showHighlightInNormalMode = false;
  private _selectedItemVersions;
  private _aggregateItems = false;
  private _itemsCount: number;
  private _leftSide: boolean;
  private _filteredItemsIds = [];
  private _filteredItemsCount = 0;

  constructor(configuration: Configuration, eventAggregator: EventAggregatorService
  ) {
    this.configuration = configuration;
    this.eventAggregator = eventAggregator;
    this.maxZoom = 50;
    this._levelOfDetails = [
      1, // zoom level 0 --> dots
      this.maxZoom * 0.08, // zoom level 1 --> iconized glyphs
      this.maxZoom * 0.2 // zoom level 2 --> detailed glyphs
    ];
  }

  /**
   * Using the current and last zoom level, check if a new level of detil was reached. If so,
   * update the configuration of the current glyph type.
   * @param {number} zoomLevel transform.k of the current d3.zoom.transform
   */
  public updateCurrentLevelOfDetail(zoomLevel: number): void {
    this._currentZoomLevel = zoomLevel;

    // Additional logic to check if there was an explicit change
    if (this.lockLevelOfDetail) {
      if (this.lockUpdated) {
        this.lockUpdated = false;
      } else {
        // After level of detail has been locked and function gets called second time, update previous level
        this.previousLevelOfDetail = this.currentLevelOfDetail;
      }
      return;
    } else if (this.lockUpdated) {
      // Even if lock is released only update next time
      this.lockUpdated = false;
      return;
    }

    let count = 0;
    let newLevel: number = this.currentLevelOfDetail;

    // set the current level of detail relative to the zoom transform k
    // (which is given by GlyphplotComponent as zoomLevel parameter for
    // this function)
    this._levelOfDetails.forEach(element => {
      if (zoomLevel > element) {
        newLevel = count;
      }
      count++;
    });
    var hasActiveFeatures = false;
    if(this.activeFeatures != undefined){
      this.activeFeatures.forEach(d => {
        if(d.active) {
          hasActiveFeatures = true;
        }
      });
    }
    if(hasActiveFeatures || this.activeFeatures == undefined){
      this.currentLevelOfDetail = newLevel;
    } else {
      this.currentLevelOfDetail = 0;
    }
  }

  /**
   * Wether or not the level of detail changed on the last zoom event.
   * @return {boolean}  1: level of detail changed 0: level of detail did not change
   */
  public levelChanged(): boolean {
    return this._previousLevelOfDetail !== this._currentLevelOfDetail;
  }

  // GETTERS AND SETTERS FOR PRIVATE ATTRIBUTES

  get color(): any {
    return this._useColorRange ? this._rangeColor : this._categoryColor;
  }

  public setData(value: any) { this._data.next(value); }
  public getData(): Observable<any> { return this._data.asObservable(); }

  get activeFeatures(): any { return this._activeFeatures; }
  set activeFeatures(features: any) { this._activeFeatures = features; }

  get featureGroups(): any { return this._featureGroups; }
  set featureGroups(groups: any) { this._featureGroups = groups; }

  get glyph(): Glyph { return this._glyph; }
  set glyph(value: Glyph) { this._glyph = value; }

  get useDragSelection(): boolean { return this._useDragSelection; }
  set useDragSelection(flag: boolean) { this._useDragSelection = flag; }

  get useForceLayout(): boolean { return this._useForceLayout; }
  set useForceLayout(flag: boolean) { this._useForceLayout = flag; }

  get currentLevelOfDetail(): number { return this._currentLevelOfDetail; }
  set currentLevelOfDetail(level: number) {
    if (this._currentLevelOfDetail === level) {
      this.previousLevelOfDetail = level;
    } else {
      this._currentLevelOfDetail = level;
    }
  }

  get levelOfDetails(): any { return this._levelOfDetails.map(level => level / this.maxZoom); }
  set levelOfDetails(lods: any) {
    lods.forEach((level, i) => {
      this._levelOfDetails[i] = level * this.maxZoom;
    });
  }

  get miniatureLevel(): number { return this._levelOfDetails[1] / this.maxZoom; }
  set miniatureLevel(l: number) { this._levelOfDetails[1] = l * this.maxZoom; }

  get previousLevelOfDetail(): number { return this._previousLevelOfDetail; }
  set previousLevelOfDetail(level: number) { this._previousLevelOfDetail = level; }

  get lockLevelOfDetail(): boolean { return this._lockLevelOfDetail; }
  set lockLevelOfDetail(lock: boolean) {
    this._lockLevelOfDetail = lock;
    this.lockUpdated = true;
  }

  get lockUpdated(): boolean { return this._lockUpdated; }
  set lockUpdated(updated: boolean) { this._lockUpdated = updated; }

  get maxZoom(): number { return this._maxZoom; }
  set maxZoom(zoom: number) { this._maxZoom = zoom; }

  get useColorRange(): boolean { return this._useColorRange; }
  set useColorRange(flag: boolean) { this._useColorRange = flag; }

  get currentLayout(): GlyphLayout { return this._currentLayout; }
  set currentLayout(layout: GlyphLayout) { this._currentLayout = layout; }

  get globalFeatureContext(): number { return this._globalFeatureContext; }
  set globalFeatureContext(newContext: number) { this._globalFeatureContext = newContext; }

  get individualFeatureContexts(): any { return this._individualFeatureContexts; }
  set individualFeatureContexts(contexts: any) { this._individualFeatureContexts = contexts; }

  get featureFilters(): FeatureFilter[] { return this._featureFilters; }
  get currentZoomLevel(): number { return this._currentZoomLevel; }

  get selectedDataSetInfo(): {
    name: string;
    version: string;
    positionAlgorithm: string;
  } {
    return this._selectedDataSetInfo;
  }
  set selectedDataSetInfo(value: {
    name: string;
    version: string;
    positionAlgorithm: string;
  }) {
    this._selectedDataSetInfo = value;
  }

  get idOfHoveredGlyph(): number { return this._idOfHoveredGlyph; }
  set idOfHoveredGlyph(value: number) {
    const changed = this._idOfHoveredGlyph !== value && value >= 0;
    this._idOfHoveredGlyph = value;

    if (this._idOfHoveredGlyph >= 0 && changed) {
      this.selectedItemVersions = [];
      const data = this._data.getValue();
      const item = data.features.find(f => {
        return f.id === this._idOfHoveredGlyph;
      });
      for (const context in item.features) {
        if (context === 'global') { continue; }
        if (item.features.hasOwnProperty(context)) {
          const features = item.features[context];
          let label: string;
          for (const ctx in data.schema['variant-context']) {
            if (data.schema['variant-context'].hasOwnProperty(ctx)) {
              const c = data.schema['variant-context'][ctx];
              if (c.id === context) {
                label = c.description;
              }
            }
          }
          this.selectedItemVersions.push({label: label, features: features});
        }
      }
      const payload = new RefreshHoverEventData(
        this._idOfHoveredGlyph,
        item.features[this.selectedContext.id],
        item);
      this.eventAggregator.getEvent(RefreshHoverEvent).publish(payload);
    }
  }

  get extendSelection(): boolean { return this._extendSelection; }
  set extendSelection(value: boolean) { this._extendSelection = value; }

  get showHighlightInNormalMode(): boolean { return this._showHighlightInNormalMode; }
  set showHighlightInNormalMode(value: boolean) { this._showHighlightInNormalMode = value; }

  get selectedItemVersions() { return this._selectedItemVersions; }
  set selectedItemVersions(array: any) { this._selectedItemVersions = array; }

  get aggregateItems() { return this._aggregateItems; }
  set aggregateItems(value: boolean) { this._aggregateItems = value; }

  get activeDataSet() { return this._activeDataSet; }
  set activeDataSet(value: any) { this._activeDataSet = value; }

  get selectedContext() { return this._selectedContext; }
  set selectedContext(value: any) { this._selectedContext = value; }

  get featureContexts() { return this._featureContexts; }
  set featureContexts(value: Array<any>) { this._featureContexts = value; }

  get selectedFeatureName() { return this._selectedFeatureName; }
  set selectedFeatureName(value: string) { this._selectedFeatureName = value; }

  get activeGlyphConfig() { return this._activeGlyphConfig; }
  set activeGlyphConfig(value: GlyphConfiguration) { this._activeGlyphConfig = value; }

  get itemsCount() { return this._itemsCount }
  set itemsCount(value: number) { this._itemsCount = value; }

  get leftSide() { return this._leftSide; }
  set leftSide(value: boolean) { this._leftSide = value; }

  get filteredItemsCount() { return this._filteredItemsCount }
  set filteredItemsCount(value: number) { this._filteredItemsCount = value; }


  get filteredItemsIds() { return this._filteredItemsIds }
  set filteredItemsIds(value: number[]) { this._filteredItemsIds = value; }

  get minScaleLevel() { return this._minScaleLevel }
  set minScaleLevel(value: number) { this._minScaleLevel = value; }

  // Refresh ID list
  public filterRefresh() {
    var filteredIds = [];

    this._data.getValue().positions.forEach(d => {
      let itemConfirmsFilter = true;
      let featureItem = this.getFeaturesForItem(d);
      const filters: FeatureFilter[] = this.featureFilters;
      let filter: FeatureFilter;

      for (let i = 0; i < filters.length; i++) {
        filter = filters[i];
        itemConfirmsFilter = itemConfirmsFilter && filter.itemConfirmsToFilter(d.id, featureItem.features, featureItem.values);
      }

      if (itemConfirmsFilter) {
        filteredIds.push(d.id);
      }
 
    });
    this._filteredItemsIds = filteredIds;
    if (this._featureFilters.length == 0) {
      this._filteredItemsCount = this._data.getValue().positions.length;
    } else {
      this._filteredItemsCount = this._filteredItemsIds.length;
    }
  }

  private getFeaturesForItem(d: any) {
    const item = this._data.getValue().features.find(f => {
        return f.id === d.id;
    });
    let itemContext = this.individualFeatureContexts[d.id];
    if (itemContext === undefined) {
        if (this.globalFeatureContext >= 0) {
            itemContext = this.globalFeatureContext;
        } else {
            itemContext = item['default-context'];
        }
    }
    const ret = {
        features: Object.assign(item.features[itemContext], item.features['global']),
        values: item.values
    }
    return ret;
  }
}
