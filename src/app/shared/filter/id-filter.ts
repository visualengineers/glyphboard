import {FeatureFilter} from './feature-filter';

export class IdFilter extends FeatureFilter {
  private _accaptableIds: number[];

  constructor(featureName?: string, acceptableIds?: number[]) {
    super(featureName);
    this._accaptableIds = acceptableIds;
  }

  public itemConfirmsToFilter(id: number, item: any): boolean {
    return this._accaptableIds.indexOf(id) !== -1;
  }

  public get accaptableIds(): number[] {
    return this._accaptableIds;
  }

  public set accaptableIds(ids: number[]) {
    this._accaptableIds = ids.sort();
  }

  public extendAccaptableIds(newIds: number[]) {
    newIds.forEach((id: number) => {
      if (this._accaptableIds.indexOf(id) === -1) {
        this._accaptableIds.push(id);
      }
    });
    this._accaptableIds.sort();
  }
}
