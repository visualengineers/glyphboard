import { Logger } from '../shared/services/logger.service';
import { Injectable } from '@angular/core';
import { Region } from './region';
import { EventAggregatorService } from 'src/app/shared/events/event-aggregator.service';
import { SwitchVisualizationEvent, VisualizationType } from 'src/app/shared/events/switch-visualization.event';

@Injectable()
export class RegionManager {
  public regions: Array<Region> = new Array<Region>();  

  private _isD3Active: boolean = false;
  private _isWebGlActive: boolean = false;
  private _isSplitScreen: boolean = false;
  private _isFeaturePlotActive: boolean = false;

  // private _evtAggregator: EventAggregatorService;

  constructor(private logger: Logger, eventAggregator: EventAggregatorService) { }

  public addRegion(name: string, widthPercent: number, heightPercent: number, display: boolean): Region {
    const reg = new Region();
    reg.name = name;
    reg.heightPercent = heightPercent;
    reg.widthPercent = widthPercent;
    reg.display = display ? 'block' : 'none';
    this.regions!.push(reg);

    return reg;
  }

  public updateRegions(width: number, height: number) {
    width -= 2; // account for splitter
    // correct height percentages
    let heightPercentSum = 0;
    let heightPercentZeroCount = 0;
    this.regions!.forEach(element => {
      if (element.display !== 'none') {
        heightPercentSum += element.heightPercent;
      }
      if (element.heightPercent === 0 && element.display !== 'none') {
        heightPercentZeroCount++;
      }
    });
    this.regions!.forEach(element => {
      if (element.heightPercent === 0 && element.display !== 'none') {
        // give the flexible regions the remaining space for height
        element.heightPercentCalc = (1 - heightPercentSum) / heightPercentZeroCount;
      } else if (element.display === 'none') {
        element.heightPercentCalc = 0;
      } else {
        element.heightPercentCalc = element.heightPercent;
      }
      //web gl canvas height
      let webglRegion = this.regions!.find(reg => reg.name === 'webgl');
      if (webglRegion !== undefined && webglRegion.display !== 'none') {
        element.heightPercentCalc = 1;
      }
    });

    this.regions!.forEach(element => {
      element.height = element.display === 'none'
        ? 0
        : heightPercentZeroCount === 0 // there is only one region!
          ? height
          : element.heightPercentCalc * height;
    });

    // correct width percentages
    let widthPercentSum = 0;
    let widthPercentZeroCount = 0;
    this.regions!.forEach(element => {
      if (element.display !== 'none') {
        widthPercentSum += element.widthPercent;
      }
      if (element.widthPercent === 0 && element.display !== 'none') {
        widthPercentZeroCount++;
      }
    });
    this.regions!.forEach(element => {
      if (element.widthPercent === 0 && element.display !== 'none') {
        // give the flexible regions the remaining space for width
        element.widthPercentCalc = (1 - widthPercentSum) / widthPercentZeroCount;
      } else if (element.display === 'none') {
        element.widthPercentCalc = 0;
      } else {
        element.widthPercentCalc = element.widthPercent;
      }
    });

    this.regions!.forEach(element => {
      element.width = element.display === 'none'
        ? 0
        : widthPercentZeroCount === 0 // there is only one region!
          ? width
          : element.widthPercentCalc * width;
    });

    let glyphsRegion = this.regions!.find(reg => reg.name === 'glyphs');
    this._isD3Active = glyphsRegion !== undefined && glyphsRegion.display !== 'none';
    let glyphs2Region = this.regions!.find(reg => reg.name === 'glyphs2');
    this._isSplitScreen = glyphs2Region !== undefined && glyphs2Region.display !== 'none';
    let featuresRegion = this.regions!.find(reg => reg.name === 'features');
    this._isFeaturePlotActive = featuresRegion !== undefined && featuresRegion.display !== 'none';
    let webglRegion = this.regions!.find(reg => reg.name === 'webgl');
    this._isWebGlActive = webglRegion !== undefined && webglRegion.display !== 'none';
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
