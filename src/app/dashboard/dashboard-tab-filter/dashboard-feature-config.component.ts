import { Component, Input, OnChanges, ElementRef, Output, EventEmitter,  ViewChild, OnInit} from '@angular/core';
import * as d3 from 'd3';
import { DataproviderService } from 'app/shared/services/dataprovider.service';
import { FeatureFilter } from 'app/shared/filter/feature-filter';
import { Configuration } from '../../shared/services/configuration.service';
import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';
import { Observable } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'feature-config-item',
  templateUrl: './dashboard-feature-config.component.html',
  styleUrls: ['./dashboard-feature-config.component.scss']
})
export class DashboardFeatureConfigComponent implements OnInit, OnChanges {
  @ViewChild('chart') private chartContainer: ElementRef;

  @Input() label: string;
  @Input() property: string;
  @Input() active = false;
  @Input() object: any;
  @Input() small = true;
  @Input() configuration: Configuration;
  @Input() events: Observable<void>;

  private eventsSubscription: any;
  private margin: any = { top: 0, bottom: 0, left: 0, right: 0};
  private chart: any;
  private svg: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private brushMin = -1;
  private brushMax = -1;
  public colorSteps: any;
  private dataSteps: number;

  private activeFilterInConfiguration: FeatureFilter;
  private propertyInConfiguration: string;

  private brush = d3.brushX()
    .on('end', () => {this.brushed(); 
      DashboardFeatureConfigComponent.filtering(this);});

  dat: any;
  data: any;

  @Output() onConfigChange = new EventEmitter<any>();
  @Output() onColorChange = new EventEmitter<any>();

  private static filtering(component: DashboardFeatureConfigComponent): void {
    if (d3.event.selection === null || d3.event.selection === undefined) {
      component.removeFilterFromConfiguration();
      return;
    }

    let filter: FeatureFilter = component.activeFilterInConfiguration;

    if (filter == null) {
      filter = new FeatureFilter();

      filter.featureName = component.propertyInConfiguration;
      component.activeFilterInConfiguration = filter;
      component.configuration.configurations[0].featureFilters.push(filter);
      component.configuration.configurations[1].featureFilters.push(filter);

    }

    const absoluteMinValue: number = +d3.min(d3.event.selection);
    const absoluteMaxValue: number = +d3.max(d3.event.selection);

    const relativeMinValue: number = absoluteMinValue / component.width;
    const relativeMaxValue: number = absoluteMaxValue / component.width;

    // TODO: Workaround because data is not bound to actual bars in chart

    const steps = 1 / component.dataSteps;
    let minValue = Math.floor(relativeMinValue/steps)*steps;
    let maxValue = (Math.floor(relativeMaxValue/steps)+1)*steps;

    filter.minValue = minValue;
    filter.maxValue = Math.min(maxValue, 1.0);

    component.configuration.configurations[0].filterRefresh();
    component.configuration.configurations[1].filterRefresh();

    component.onLayoutChange();
  };

  private loadValues(property, dat) {
    if (dat === undefined || dat['features'][property] === undefined) {
      return null;
    }
    const active = dat['features'][property]['histogram'];

    const values = [];
    let i = 0;
    for (const key in active) {
      if (active.hasOwnProperty(key)) {
        const n = [ i, Math.round(active[key] * 99) + 1 ];
        values.push(n);
        i++;
      }
    }
    return values;
  }

  ngOnInit() {
    this.eventsSubscription = this.events.subscribe(() => this.clearFilter());

    this.dataProvider.getDataSet().subscribe(message => {
      if (message == null) { return; }
      this.dat = message.meta;
      this.data = this.loadValues(this.property, this.dat);
      this.dataSteps = this.data.length;
    });

    this.width = 80;
    this.height = 50;

    this.colorSteps = [
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
    ];

    if (this.data) {
      this.createChart();
      this.updateChart();
    }

    // since the label is a string and the items only have indexed properties, find the property
    // matching the label of this component
    if (this.configuration.configurations[0].activeFeatures === undefined) {
      this.propertyInConfiguration = this.configuration.configurations[1].activeFeatures
        .find(feature => feature.label === this.label)
        .property;
    } else {
      this.propertyInConfiguration = this.configuration.configurations[0].activeFeatures
        .find(feature => feature.label === this.label)
        .property;
    }
  }

  ngOnChanges() { }

  constructor(private dataProvider: DataproviderService, private eventAggregator: EventAggregatorService) { }

  public changed(): void {
    this.active = !this.active;
    this.updateColoring();
    this.onConfigChange.emit(this.object);


  }

  public selectColor(): void {
    this.onColorChange.emit(this.object);
  }

  public resize(): void {
    if (this.small) {
      this.width = 340;
    } else {
      this.width = 80;
      this.removeFilterFromConfiguration();
    
      this.brushMax = -1;
      this.brushMin = -1;
    }

    d3.select(this.chartContainer.nativeElement).selectAll('*').remove();

    this.small = !this.small;

    this.createChart();
      if (this.data) {
        this.updateChart();
      }
  }

  private createChart() {
    const element = this.chartContainer.nativeElement;
    this.svg = d3.select(element).append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('id', this.label);

    // chart plot area
    this.chart = this.svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // define X & Y domains
    const xDomain = this.data.map(d => d[0]);
    const yDomain = this.data.map(d => d[1]);

    // create scales
    this.xScale = d3.scaleBand().padding(0).domain(xDomain).range([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);
}

  private updateChart() {
    // update scales
    this.xScale.domain(this.data.map(d => d[0]));
    this.yScale.domain([0, d3.max(this.data, d => d[1])]);

    const that = this;
    const update = this.chart.selectAll('.bar').data(this.data);

    // remove existing bars
    update.exit().remove();

    // add new bars
    update.enter()
      .append('rect')
        .attr('class', 'bar')
        .attr('x', d => this.xScale(d[0]))
        .attr('y', d => this.yScale(0))
        .attr('width', d => this.xScale.bandwidth())
        .attr('height', 0)
        .attr('display', 'block')
        .style('fill', d => this.colorDecision(d))
        .transition()
        .attr('y', d => this.yScale(d[1]))
        .attr('height', d => this.height - this.yScale(d[1]));

    if (!this.small && this.chart.selectAll('#overlay-wrap').empty()) {

      this.chart.append('g')
      .attr('id', 'overlay-wrap').call(this.brush);

      const tooltip = d3.select('#' + this.label).append('g')
      .attr('class', 'tooltip')
      .attr('id', this.property)
      .style('display', 'none');

      tooltip.append('rect')
      .attr('width', 60)
      .attr('height', 20)
      .attr('fill', 'white')
      .style('opacity', 0.0);

      tooltip.append('text')
      .attr('x', 2)
      .attr('dy', '1.2em')
      .style('text-anchor', 'right')
      .attr('font-size', '12px');

      this.chart.selectAll('.selection')
      .style('fill', '#0093d6')
      .on('mouseover', function() { tooltip.style('display', 'block'); })
      .on('mousemove', function() {
      tooltip
        .select('text')
        .text(
            Math.round((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
              + '-'
              + Math.round(((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) + 1 ) / that.dataSteps) * 100) / 100);
      })
      .on('mouseout', function() { tooltip.style('display', 'none');
      });

      this.chart.selectAll('.overlay')
      .on('mouseover', function() { tooltip.style('display', 'block'); })
      .on('mousemove', function() {
      tooltip
        .select('text')
        .text(
          Math.round((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
            + '-'
            + Math.round(((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) + 1 ) / that.dataSteps) * 100) / 100);
      })
      .on('mouseout', function() { tooltip.style('display', 'none');
      });

      this.chart.selectAll('.handle')
      .on('mousemove', function() {
        tooltip
          .select('text')
          .text(
            Math.round((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
              + '-'
              + Math.round(((Math.floor(d3.mouse(this)[0] / (that.width / that.dataSteps)) + 1 ) / that.dataSteps) * 100) / 100);
      });
    }
    };

  private removeFilterFromConfiguration(): void {
    if (this.activeFilterInConfiguration == null) { return; }

    const featureFilters = this.configuration.configurations[0].featureFilters;
    const featureFiltersSecond = this.configuration.configurations[1].featureFilters;
    const activeIndex = featureFilters.indexOf(this.activeFilterInConfiguration);
    this.activeFilterInConfiguration = null;
    featureFilters.splice(activeIndex, 1);
    featureFiltersSecond.splice(activeIndex, 1);
    this.onLayoutChange();
  };

  public clearFilter() {
    if (this.activeFilterInConfiguration == null) { return; }

    this.brushMin = -1;
    this.brushMax = -1;
    this.chart.selectAll('.bar').style('fill',  d => this.colorDecision(d));
    this.removeFilterFromConfiguration();
    this.chart.select('#overlay-wrap').call(this.brush.move, null);
    this.configuration.configurations[0].filterRefresh();
    this.configuration.configurations[1].filterRefresh();
    this.updateChart();
  }

  public onLayoutChange() {
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  // coloring for selected bars in histograms
  private brushed() {
    if (d3.event === undefined || d3.event.selection === undefined || d3.event.selection === null) {
      return;
    }

    const x = d3.scaleLinear()
      .domain(this.data.map(d => d[0]))
      .range([0, this.width])
    const selection = d3.event.selection.map(x.invert, x);
    this.brushMin = +d3.min(selection) * this.dataSteps;
    this.brushMax = Math.floor(+d3.max(selection) * this.dataSteps);

    this.chart.selectAll('.bar').style('fill',  d => this.colorDecision(d));
  }

  private colorDecision(d) {
    if (this.brushMin <= d[0] + 1 && d[0] <= this.brushMax) {
      return '#0093d6';
    } else {
      if (this.active) {
        return '#1a1a1a';
      } else {
        return '#989898';
      }
  }}

  private updateColoring() {
    this.chart.selectAll('.bar')
    .style('fill', d => this.colorDecision(d));
  }
}
