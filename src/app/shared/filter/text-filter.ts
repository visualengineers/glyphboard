import {FeatureFilter} from './feature-filter';
import * as _ from 'lodash';

export class TextFilter extends FeatureFilter {
  private _acceptableStrings: string[];

  constructor(acceptableStrings?: string[]) {
    super();
    this.acceptableStrings = acceptableStrings;
  }

  public itemConfirmsToFilter(id: number, item: any, values: any): boolean {
    let ret = false;
    const myStrings = this.acceptableStrings;

    _.map(values, function(value, key) {
        _.map(myStrings, function(str, index) {
            if (typeof value !== 'string') {
              return false;
            }
            if (value.toLowerCase().indexOf(str) >= 0) {
                ret = true;
                return ret;
            }
        });
    });

    return ret;
  }

  public get acceptableStrings(): string[] {
    return this._acceptableStrings;
  }

  public set acceptableStrings(newStrings: string[]) {
    this._acceptableStrings = [];
    newStrings.forEach((text: string) => {
      this._acceptableStrings.push(text.toLowerCase());
    });
    this._acceptableStrings.sort();
  }

  public extendacceptableStrings(newStrings: string[]) {
    newStrings.forEach((text: string) => {
      if (this._acceptableStrings.indexOf(text.toLowerCase()) === -1) {
        this._acceptableStrings.push(text.toLowerCase());
      }
    });
    this._acceptableStrings.sort();
  }
}
