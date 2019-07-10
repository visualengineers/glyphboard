import { Logger } from '../shared/services/logger.service';
import * as d3 from 'd3';
import { Injectable } from '@angular/core';
import { Region } from './region';
import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';
import { SwitchVisualizationEvent, VisualizationType } from 'app/shared/events/switch-visualization.event';

@Injectable()
export class RegionManager {
  public regions: Array<Region>;  

  private _isD3Active: boolean;
  private _isWebGlActive: boolean;
  private _isSplitScreen: boolean;
  private _isFeaturePlotActive: boolean;

  // private _evtAggregator: EventAggregatorService;

  constructor(private logger: Logger, eventAggregator: EventAggregatorService) {
    this.regions = new Array<Region>();
    // this._evtAggregator = eventAggregator
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
      //web gl canvas height
      if (this.regions.find(reg => reg.name === 'webgl').display !== 'none') {
        element.heightPercentCalc = 1;
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

    this._isD3Active = this.regions.find(reg => reg.name === 'glyphs').display !== 'none';
    this._isSplitScreen = this.regions.find(reg => reg.name === 'glyphs2').display !== 'none';
    this._isFeaturePlotActive = this.regions.find(reg => reg.name === 'features').display !== 'none';
    this._isWebGlActive = this.regions.find(reg => reg.name === 'webgl').display !== 'none';
  }

  public IsD3Active(): boolean {
      return this._isD3Active;
  }

  public IsSplitScreen(): boolean {
    return this._isSplitScreen;
  }

  public IsFeaturePlotActive(): boolean {
    return this._isFeaturePlotActive;
  }

  public IsWebGlActive(): boolean {
    return this._isWebGlActive;
  }
}
