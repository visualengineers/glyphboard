import { Logger } from '../shared/services/logger.service';
import { Injectable } from '@angular/core';
import { Region } from './region';

@Injectable()
export class RegionManager {
  public regions: Array<Region>;

  constructor(private logger: Logger) {
    this.regions = new Array<Region>();
  }

  public addRegion(name: string, widthPercent: number, heightPercent: number, display: boolean): Region {
    const reg = new Region();
    reg.name = name;
    reg.heightPercent = heightPercent;
    reg.widthPercent = widthPercent;
    reg.display = display ? 'block' : 'none';
    this.regions.push(reg);

    return reg;
  }

  public updateRegions(width: number, height: number) {
    width -= 2; // account for splitter
    // correct height percentages
    let heightPercentSum = 0;
    let heightPercentZeroCount = 0;
    this.regions.forEach(element => {
      if (element.display !== 'none') {
        heightPercentSum += element.heightPercent;
      }
      if (element.heightPercent === 0 && element.display !== 'none') {
        heightPercentZeroCount++;
      }
    });
    this.regions.forEach(element => {
      if (element.heightPercent === 0 && element.display !== 'none') {
        // give the flexible regions the remaining space for height
        element.heightPercentCalc = (1 - heightPercentSum) / heightPercentZeroCount;
      } else if (element.display === 'none') {
        element.heightPercentCalc = 0;
      } else {
        element.heightPercentCalc = element.heightPercent;
      }
    });

    this.regions.forEach(element => {
      element.height = element.display === 'none'
        ? 0
        : heightPercentZeroCount === 0 // there is only one region!
          ? height
          : element.heightPercentCalc * height;
    });

    // correct width percentages
    let widthPercentSum = 0;
    let widthPercentZeroCount = 0;
    this.regions.forEach(element => {
      if (element.display !== 'none') {
        widthPercentSum += element.widthPercent;
      }
      if (element.widthPercent === 0 && element.display !== 'none') {
        widthPercentZeroCount++;
      }
    });
    this.regions.forEach(element => {
      if (element.widthPercent === 0 && element.display !== 'none') {
        // give the flexible regions the remaining space for width
        element.widthPercentCalc = (1 - widthPercentSum) / widthPercentZeroCount;
      } else if (element.display === 'none') {
        element.widthPercentCalc = 0;
      } else {
        element.widthPercentCalc = element.widthPercent;
      }
    });

    this.regions.forEach(element => {
      element.width = element.display === 'none'
        ? 0
        : widthPercentZeroCount === 0 // there is only one region!
          ? width
          : element.widthPercentCalc * width;
    });
  }
}
