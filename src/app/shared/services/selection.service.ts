import { Injectable } from '@angular/core';
import { FeatureFilter } from 'src/app/shared/filter/feature-filter';
import { EventAggregatorService } from '../events/event-aggregator.service';
import { RefreshSelectionEvent } from '../events/refresh-selection.event';
import { Point } from '../types/point';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {

  private _data: any;
  private _selectedItems: any;
  private _filteredItemsIds: any[] = [];
  private _filteredItemsCount = 0;
  private _featureFilters: FeatureFilter[] = []; // list of filters applied to glyphs  
  private _selectedHistogram: Array<Array<number>> | undefined;

  
  public set data(data: any) {
    this._data = data;
  }

  public get selectedItems():any {
    return this._selectedItems;
  } 

  public get selectedItemsIds(): number[] {
    return this._selectedItems.positions.reduce((arrayOfIds: number[], item: any) => {
      arrayOfIds.push(item.id);
      return arrayOfIds;
    }, []);
  }

  get filteredItemsCount() { return this._filteredItemsCount }
  set filteredItemsCount(value: number) { this._filteredItemsCount = value; }

  get selectedHistogram() { return this._selectedHistogram }

  get filteredItemsIds() { return this._filteredItemsIds }
  set filteredItemsIds(value: number[]) { this._filteredItemsIds = value; }  

  get featureFilters(): FeatureFilter[] { return this._featureFilters; }
  set featureFilters(filter: FeatureFilter[]) { this._featureFilters = filter;}  

  public selectByArea(start: Point, end: Point): any {

    const selectedArea = { start: start, end: end };
    // create independence from direction of selection-movement
    const top: number = (selectedArea.end.y < selectedArea.start.y)
      ? selectedArea.end.y
      : selectedArea.start.y;
    const bottom: number = (top === selectedArea.end.y)
      ? selectedArea.start.y
      : selectedArea.end.y;
    const left: number = (selectedArea.end.x < selectedArea.start.x)
      ? selectedArea.end.x
      : selectedArea.start.x;
    const right: number = (left === selectedArea.end.x)
      ? selectedArea.start.x
      : selectedArea.end.x;

    const filteredData = Object.create(this._data);

    const selectedIds: any[] = [];
    filteredData.positions = filteredData.positions.filter((elem: any) => {
      const position = elem.position;
      if (!this.checkClipping(position)
         && position.x > left && position.x < right
         && position.y > top && position.y < bottom) {
        selectedIds.push(elem.id);
        return true;
      };
      return false;
    });

    filteredData.features = filteredData.features.filter((elem: any) => {
      return selectedIds.indexOf(elem.id) !== -1;
    });

    this._selectedItems = filteredData;
  }

  checkClipping(firstParam: any, secondParam?: any): boolean {
    let x = 0;
    let y = 0;
    if (secondParam === undefined) {
      x = firstParam.x;
      y = firstParam.y;
    } else {
      x = firstParam;
      y = secondParam;
    }
    return x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight;
  }

  // Refresh ID list
  public filterRefresh() {
    let filteredIds: any[] = [];
    let features: any[] = this._data.meta.features;
    const binCount: number = Object.keys(Object.values(features).shift()['histogram']).length;
    let histogram: Array<Array<number>> = new Array(Object.keys(this._data.meta.features).length).fill(0).map( x => (Array(binCount).fill(0)));
    const histoStep: number = 1;

    this._data.positions.forEach((d: any) => {
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
        // calculate histograms
        Object.values<number>(featureItem.features).forEach((feature, featureIndex) => {
          let bin: number = Math.floor(feature*binCount);
          if (bin >= binCount) {
            bin = binCount-1;
          }
          histogram[featureIndex][bin] += histoStep;
        });
      }
    });
    this._filteredItemsIds = filteredIds;
    if (this._featureFilters.length == 0) {
      this._filteredItemsCount = this._data.positions.length;
      this._selectedHistogram = undefined;
    } else {
      this._filteredItemsCount = this._filteredItemsIds.length;
      this._selectedHistogram = histogram;
    }
    this.eventAggregator.getEvent(RefreshSelectionEvent).publish(true);
  }

  private getFeaturesForItem(d: any) {
    const item = this._data.features.find((f: any) => {
        return f.id === d.id;
    });
    let itemContext = item['default-context'];
    
    const ret = {
        features: Object.assign(item.features[itemContext], item.features['global']),
        values: item.values
    }
    return ret;
  }  

  constructor(private eventAggregator: EventAggregatorService) { }
}
