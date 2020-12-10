import { Component, OnInit, ElementRef, ViewChild, Injector } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { FlowerGlyph } from '../../glyph/glyph.flower';
import { StarGlyph } from '../../glyph/glyph.star';
import * as d3 from 'd3';
import { Glyph } from '../../glyph/glyph';
import { FlowerGlyphConfiguration } from '../../glyph/glyph.flower.configuration';
import { StarGlyphConfiguration } from '../../glyph/glyph.star.configuration';
import { GlyphType } from '../../glyph/glyph.type';
import { RefreshConfigEvent } from 'src/app/shared/events/refresh-config.event';
import { registerLocaleData } from '@angular/common';
import de from '@angular/common/locales/de';
import { RefreshHoverEvent } from 'src/app/shared/events/refresh-hover.event';
import { RefreshHoverEventData } from 'src/app/shared/events/refresh-hover.event.data';

@Component({
  selector: 'app-dashboard-glyphlegend',
  templateUrl: './dashboard-glyphlegend.component.html',
  styleUrls: ['./dashboard-glyphlegend.component.scss']
})
export class DashboardGlyphlegendComponent extends DashboardTabComponent implements OnInit {
  @ViewChild('canvas') private container: ElementRef | undefined;

  private context: any; // 2D context of the example glyph canvas

  private glyph: Glyph | undefined;
  private flowerGlyph: FlowerGlyph | undefined;
  private flowerConfig: FlowerGlyphConfiguration | undefined;
  private starGlyph: StarGlyph | undefined;
  private starConfig: StarGlyphConfiguration | undefined;

  private dummyFeatures: any;

  constructor(injector: Injector) {
    super(injector);

    this.eventAggregator.getEvent(RefreshHoverEvent).subscribe(this.onRefreshHover);
  }

  ngOnInit() {
    registerLocaleData(de);

    this.eventAggregator
      .getEvent(RefreshConfigEvent)
      .subscribe(this.onRefreshConfig);

    this.dataProvider.getDataSet().subscribe(message => {
      if (message == null || message === undefined) {
        return;
      }
      if (this.configuration.configurations[0].activeDataSet === undefined) {
        return;
      }
      // update view
      this.updateDummyFeatures();
      this.createDashboard();
      this.drawExampleGlyph();
    });
  }

  private updateDummyFeatures() {
    this.dummyFeatures = {};
    for (const l in this.configuration.configurations[0].activeDataSet.schema.label) {
      if (this.configuration.configurations[0].activeDataSet.schema.label.hasOwnProperty(l)) {
        this.dummyFeatures[l] = Math.random();
      }
    }
  }

  private onRefreshHover = (payload: RefreshHoverEventData) => {
    this.dummyFeatures = payload.features;
    this.drawExampleGlyph();
  }

  private onRefreshConfig = (payload: boolean) => {
    this.createDashboard();
    this.drawExampleGlyph();
  }

  private createDashboard() {
    this.flowerConfig = this.configuration.flowerConfigs[2].clone() as FlowerGlyphConfiguration;
    this.flowerConfig.useLabels = true;
    this.flowerConfig.radius = this.configuration.legendGlyphRadius;
    this.starConfig = this.configuration.starConfigs[2].clone() as StarGlyphConfiguration;
    this.starConfig.useLabels = true;
    this.starConfig.radius = this.configuration.legendGlyphRadius;

    const element = this.container?.nativeElement;
    this.context = element.getContext('2d');

    this.updateAccessors();

    const colorFeature = this.configuration.configurations[0].activeDataSet.schema.color;
    const colorScale = (item: any) =>
      this.configuration.configurations[0].color(item[colorFeature]);

    this.flowerGlyph = new FlowerGlyph(
      this.context,
      colorScale,
      this.flowerConfig
    );
    this.starGlyph = new StarGlyph(
      this.context,
      colorScale,
      this.starConfig
    );

    this.glyph = this.configuration.activeGlyphType === GlyphType.Flower
      ? this.flowerGlyph
      : this.starGlyph;
  }

    /**
   * Draws an example glyph onto the canvas using the active glyph and it's
   * configuration
   * @return {void}
   */
  private drawExampleGlyph(): void {
    this.context.save();
    this.context.clearRect(0, 0, 400, 300);

    const dummyPosition: any = {
      x: 175,
      y: 125
    };

    if(this.configuration.configurations[0].featureGroups) {
      this.drawGroupArcs();
    }

    const labels: any[] = [];
    this.configuration.configurations[0].activeFeatures.forEach((feat: any) => {
      if (feat.active) { labels.push(feat.label); }
    });
    if (labels.length != 0) {
      this.context.beginPath();
      this.glyph?.drawWithLabels(
        dummyPosition,
        this.dummyFeatures,
        1.0,
        false,
        labels
      );
      this.context.restore();
      }
  }

  private updateAccessors(): void {
    const that = this;
    const accessorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, 100]);

    this.configuration.activeGlyphConfig().accessors.length = 0;

    // create an accessor for every feature that is to be displayed in the glyph according to the
    // schema
    for (const key in this.configuration.configurations[0].activeFeatures) {
      if (this.configuration.configurations[0].activeFeatures.hasOwnProperty(key)) {
        const value = this.configuration.configurations[0].activeFeatures[key];
        if (value.active) {
          that.configuration.activeGlyphConfig().accessors.push((d: any) => {
            return accessorScale(d[value.property]);
          });
        }
      }
    }
  }

  private drawGroupArcs() {
    var activeFeatureCount = Array<number>(Object.keys(this.configuration.configurations[0].activeFeatures).length).fill(0);

    this.configuration.configurations[0].activeFeatures.forEach((d: any) => { 
      if (d.active) {
          Object.keys(this.configuration.configurations[0].featureGroups).forEach((key: any) => {
            if(this.configuration.configurations[0].featureGroups[key].member.indexOf(d.property) > -1 ) {
              activeFeatureCount[key]++;
            }
          });
      }  
    });
    
    var activeFeautureSum = activeFeatureCount.reduce((a, b) => a + b, 0);

    
    var radPerStep = Math.PI/180*360/activeFeautureSum;
    var startAngle = 0;

    activeFeatureCount.forEach( d => {
      if (d!=0) {
        //actual arc
        var endAngle = (startAngle+(d-1)*radPerStep);
        this.context.beginPath();
		    this.context.arc(175, 125, 67, startAngle-0.25*radPerStep, endAngle+0.25*radPerStep, false);
		    this.context.strokeStyle= "#ebebeb";
		    this.context.stroke();
        this.context.closePath();

        //circle at arc beginning
        this.context.translate(175, 125);
        this.context.rotate(startAngle-0.25*radPerStep);
        this.context.translate(67, 0);
        this.context.beginPath();
        this.context.arc(0, 0, 3, 0, 2*Math.PI, false);
		    this.context.strokeStyle= "#ebebeb";
		    this.context.fillStyle= "#373737";
	    	this.context.stroke();
        this.context.fill();
        this.context.closePath();
        this.context.setTransform(1, 0, 0, 1, 0, 0);

        //circle at arc ending
        this.context.translate(175, 125);
        this.context.rotate(endAngle+0.25*radPerStep);
        this.context.translate(67, 0);
        this.context.beginPath();
        this.context.arc(0, 0, 3, 0, 2*Math.PI, false);
		    this.context.strokeStyle= "#ebebeb";
		    this.context.fillStyle= "#373737";
	    	this.context.stroke();
        this.context.fill();
        this.context.closePath();
        this.context.setTransform(1, 0, 0, 1, 0, 0);

        //circle at arc ending
        this.context.translate(175, 125);
        this.context.rotate((startAngle+endAngle)/2);
        this.context.translate(70, 0);
        this.context.beginPath();
        this.context.arc(0, 0, 10, 0, 2*Math.PI, false);
		    this.context.fillStyle= "#373737";
        this.context.fill();
        this.context.closePath();
        this.context.setTransform(1, 0, 0, 1, 0, 0);

        //group label
        this.context.translate(175, 130);
        this.context.rotate((startAngle+endAngle)/2);
        this.context.translate(70, 0);
        this.context.rotate(-(startAngle+endAngle)/2);
        this.context.beginPath();
        this.context.textAlign = 'center';
        this.context.font = '14px Glyphboard-Condensed';
        this.context.fillStyle = '#ebebeb';
        this.context.fillText(activeFeatureCount.indexOf(d), 0, 0);
        this.context.closePath();
        this.context.setTransform(1, 0, 0, 1, 0, 0);

        startAngle = endAngle+radPerStep;
      }
    });
  }

  public onColorScaleChange(e: any): void {
    this.configuration.configurations[0].useColorRange = !this.configuration.configurations[0].useColorRange;
    this.configuration.configurations[1].useColorRange = this.configuration.configurations[0].useColorRange;
    this.onLayoutChange();
  }
}
