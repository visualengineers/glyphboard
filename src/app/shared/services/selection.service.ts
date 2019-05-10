import { Injectable } from '@angular/core';
import { FeatureFilter } from 'app/shared/filter/feature-filter';

@Injectable({
  providedIn: 'root'
})
export class SelectionService {

  private _data: any;
  private _selectedItems: any;
  private _filteredItemsIds = [];
  private _filteredItemsCount = 0;
  private _featureFilters: FeatureFilter[] = []; // list of filters applied to glyphs  

  
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

    const selectedIds = [];
    filteredData.positions = filteredData.positions.filter((elem) => {
      const position = elem.position;
      if (!this.checkClipping(position)
         && position.x > left && position.x < right
         && position.y > top && position.y < bottom) {
        selectedIds.push(elem.id);
        return true;
      };
    });

    filteredData.features = filteredData.features.filter((elem) => {
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
    var filteredIds = [];

    this._data.positions.forEach(d => {
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
      // add this._data.features[d.id].features to histogram bins with the count of this._data-meta.features[0].histogram.length of the feature
      // write it into this._dataSelected.meta.features[feature].histogram
      }
 
    });
    this._filteredItemsIds = filteredIds;
    if (this._featureFilters.length == 0) {
      this._filteredItemsCount = this._data.positions.length;
    } else {
      this._filteredItemsCount = this._filteredItemsIds.length;
      console.log(this._data);
    }
  }

  private getFeaturesForItem(d: any) {
    const item = this._data.features.find(f => {
        return f.id === d.id;
    });
    let itemContext = item['default-context'];
    
    const ret = {
        features: Object.assign(item.features[itemContext], item.features['global']),
        values: item.values
    }
    return ret;
  }  

  constructor() { }
}
