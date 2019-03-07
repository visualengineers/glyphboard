import { Component, OnInit, ElementRef, ViewChild, Injector } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { FlowerGlyph } from '../../glyph/glyph.flower';
import { StarGlyph } from '../../glyph/glyph.star';
import * as d3 from 'd3';
import { Glyph } from '../../glyph/glyph';
import { FlowerGlyphConfiguration } from '../../glyph/glyph.flower.configuration';
import { StarGlyphConfiguration } from '../../glyph/glyph.star.configuration';
import { GlyphType } from '../../glyph/glyph.type';
import { RefreshConfigEvent } from 'app/shared/events/refresh-config.event';
import { registerLocaleData } from '@angular/common';
import de from '@angular/common/locales/de';
import { RefreshHoverEvent } from 'app/shared/events/refresh-hover.event';
import { RefreshHoverEventData } from 'app/shared/events/refresh-hover.event.data';

@Component({
  selector: 'app-dashboard-glyphlegend',
  templateUrl: './dashboard-glyphlegend.component.html',
  styleUrls: ['./dashboard-glyphlegend.component.scss']
})
export class DashboardGlyphlegendComponent extends DashboardTabComponent implements OnInit {
  @ViewChild('canvas') private container: ElementRef;

  private context: any; // 2D context of the example glyph canvas

  private glyph: Glyph;
  private flowerGlyph: FlowerGlyph;
  private flowerConfig: FlowerGlyphConfiguration;
  private starGlyph: StarGlyph;
  private starConfig: StarGlyphConfiguration;

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
      if (message == null) {
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

    const element = this.container.nativeElement;
    this.context = element.getContext('2d');

    this.updateAccessors();

    const colorFeature = this.configuration.configurations[0].activeDataSet.schema.color;
    const colorScale = item =>
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

    const labels = [];
    this.configuration.configurations[0].activeFeatures.forEach(feat => {
      if (feat.active) { labels.push(feat.label); }
    });

    this.context.beginPath();
    this.glyph.drawWithLabels(
      dummyPosition,
      this.dummyFeatures,
      1.0,
      false,
      labels
    );
    this.context.restore();
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
          that.configuration.activeGlyphConfig().accessors.push(d => {
            return accessorScale(d[value.property]);
          });
        }
      }
    }
  }

  public onColorScaleChange(e: any): void {
    this.configuration.configurations[0].useColorRange = !this.configuration.configurations[0].useColorRange;
    this.configuration.configurations[1].useColorRange = this.configuration.configurations[0].useColorRange;
    this.onLayoutChange();
  }
}
