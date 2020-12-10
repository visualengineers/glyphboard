import { Component, Input, OnChanges, ElementRef, Output, EventEmitter,  ViewChild, AfterViewInit, OnInit} from '@angular/core';
import * as d3 from 'd3';
import { DataproviderService } from 'src/app/shared/services/dataprovider.service';
import { FeatureFilter } from 'src/app/shared/filter/feature-filter';
import { Configuration } from '../../shared/services/configuration.service';
import { EventAggregatorService } from 'src/app/shared/events/event-aggregator.service';
import { RefreshPlotEvent } from 'src/app/shared/events/refresh-plot.event';
import { Observable } from 'rxjs';
import { SelectionService } from 'src/app/shared/services/selection.service';
import { RefreshSelectionEvent } from 'src/app/shared/events/refresh-selection.event';
import { ToggleGroupEvent } from 'src/app/shared/events/toggle-group.event';
import { RefreshConfigEvent } from 'src/app/shared/events/refresh-config.event';
import { D3BrushEvent } from 'd3';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'feature-config-item',
  templateUrl: './dashboard-feature-config.component.html',
  styleUrls: ['./dashboard-feature-config.component.scss']
})
export class DashboardFeatureConfigComponent implements AfterViewInit, OnChanges, OnInit {
  @ViewChild('chart') private chartContainer: ElementRef | undefined;

  @Input() label: string = "";
  @Input() property: string = "";
  @Input() active = false;
  @Input() object: any;
  @Input() small = true;
  @Input() configuration: Configuration | undefined;
  @Input() events: Observable<void> | undefined;

  private eventsSubscription: any;
  private margin: any = { top: 0, bottom: 0, left: 0, right: 0};
  private chart: any;
  private svg: any;
  private width: number = 0;
  private height: number = 0;
  private xScale: any;
  private yScale: any;
  private brushMin = -1;
  private brushMax = -1;
  public colorSteps: any;
  private dataSteps: number = 1;
  private block = false;

  private activeFilterInConfiguration: FeatureFilter | undefined;
  private propertyInConfiguration: string = "";

  private brush = d3.brushX()
    .on('end', (event: any, d: any) => {this.brushed(event); 
      DashboardFeatureConfigComponent.filtering(this, event);});

  private _dat: any;
  private _data: any;

  @Output() onConfigChange = new EventEmitter<any>();
  @Output() onColorChange = new EventEmitter<any>();

  private static filtering(component: DashboardFeatureConfigComponent, event: any): void {
    if (event.selection === null || event.selection === undefined) {
      component.removeFilterFromConfiguration();
      return;
    }
    
    let filter: FeatureFilter | undefined = component.activeFilterInConfiguration;

    if (filter == null) {
      filter = new FeatureFilter();

      filter.featureName = component.propertyInConfiguration;
      component.activeFilterInConfiguration = filter;

      component.selectionService.featureFilters.push(filter);
    }
    const absoluteMinValue: number = +d3.min(event.selection)!;
    const absoluteMaxValue: number = +d3.max(event.selection)!;

    const relativeMinValue: number = absoluteMinValue / component.width;
    const relativeMaxValue: number = absoluteMaxValue / component.width;

    // TODO: Workaround because data is not bound to actual bars in chart

    const steps = 1 / component.dataSteps;
    let minValue = Math.floor(relativeMinValue/steps)*steps;
    let maxValue = (Math.floor(relativeMaxValue/steps)+1)*steps;

    filter.minValue = minValue;
    filter.maxValue = Math.min(maxValue, 1.0);

    component.selectionService.filterRefresh();
    component.onLayoutChange();
  };

  private loadValues(property: any, dat: any) {
    if (dat === undefined || dat['features'][property] === undefined) {
      return null;
    }
    let active: any = {};
    if (this.selectionService.selectedHistogram === undefined) {
      active = dat['features'][property]['histogram'];
      //console.log(active);
    } else {
      if (this.selectionService.selectedHistogram[property]) {
        this.selectionService.selectedHistogram[property].forEach((currentElement: any, index: number) => {
          active[index] = currentElement;
        });
        //console.log(active);
      }
    }

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
  }

  ngAfterViewInit() {
    this.eventsSubscription = this.events!.subscribe(() => this.clearFilter());

    this.dataProvider.getDataSet().subscribe(message => {
      if (message == null) { return; }
      this._dat = message.meta;
      this._data = this.loadValues(this.property, this._dat);
      if (this._data) {
        this.dataSteps = this._data.length;
      }
    });

    if (this._data) {
      this.createChart(true);
      this.updateChart(true);
    }

    // since the label is a string and the items only have indexed properties, find the property
    // matching the label of this component
    if (this.configuration!.configurations[0].activeFeatures === undefined) {
      this.propertyInConfiguration = this.configuration!.configurations[1].activeFeatures
        .find((feature: any) => feature.label === this.label)
        .property;
    } else {
      this.propertyInConfiguration = this.configuration!.configurations[0].activeFeatures
        .find((feature: any) => feature.label === this.label)
        .property;
    }
  }

  ngOnChanges() { }

  constructor(private dataProvider: DataproviderService, private eventAggregator: EventAggregatorService, private selectionService: SelectionService) {
    this.eventAggregator
    .getEvent(ToggleGroupEvent)
    .subscribe(this.toggleGroupState);
    this.eventAggregator
    .getEvent(RefreshSelectionEvent)
    .subscribe(this.onRefreshSelection);
  }

  public changed(): void {
    this.active = !this.active;
    this.updateColoring();
    this.onConfigChange.emit(this.object);
  }

  onRefreshSelection = (payload: boolean) =>  {
    this._data = this.loadValues(this.property, this._dat);
    d3.select(this.chartContainer!.nativeElement).selectAll('*').remove();
    this.createChart();
      if (this._data) {
        this.updateChart();
      }
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

    d3.select(this.chartContainer!.nativeElement).selectAll('*').remove();

    this.small = !this.small;

    this.createChart();
      if (this._data) {
        this.updateChart();
      }
  }

  private createChart(init: boolean = false) {
    if (!this._data) {
      return;
    }
    const element = this.chartContainer!.nativeElement;
    if (init) {
      this.selectionService.featureFilters.forEach( d => {
        if (d.featureName == this.property) {
          this.small = false;
          this.width = 340;
        }
      });
    }
    this.svg = d3.select(element).append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('id', this.label);

    // chart plot area
    this.chart = this.svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // define X & Y domains
    const xDomain = this._data.map((d: any) => d[0]);
    const yDomain = this._data.map((d: any) => d[1]);

    // create scales
    this.xScale = d3.scaleBand().padding(0).domain(xDomain).range([0, this.width]);
    this.yScale = d3.scaleLinear().domain(yDomain).range([this.height, 0]);
}

  private updateChart(init: boolean = false) {
    // update scales
    this.xScale.domain(this._data.map((d: any) => d[0]));
    this.yScale.domain([0, d3.max(this._data, (d: any) => d[1])]);

    const that = this;
    const update = this.chart.selectAll('.bar').data(this._data);

    // remove existing bars
    update.exit().remove();

    // add new bars
    update.enter()
      .append('rect')
        .attr('class', 'bar')
        .attr('x', (d: any) => this.xScale(d[0]))
        .attr('y', (d: any) => this.yScale(0))
        .attr('width', (d: any) => this.xScale.bandwidth())
        .attr('height', 0)
        .attr('display', 'block')
        .style('fill', (d: any) => this.colorDecision(d))
        .transition()
        .attr('y', (d: any) => this.yScale(d[1]))
        .attr('height', (d: any) => this.height - this.yScale(d[1]));

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
      .on('mousemove', function(event: any, d: any) {
      tooltip
        .select('text')
        .text(
            Math.round((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
              + '-'
              + Math.round(((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) + 1 ) / that.dataSteps) * 100) / 100);
      })
      .on('mouseout', function() { tooltip.style('display', 'none');
      });

      this.chart.selectAll('.overlay')
      .on('mouseover', function() { tooltip.style('display', 'block'); })
      .on('mousemove', function(event: any, d: any) {
      tooltip
        .select('text')
        .text(
          Math.round((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
            + '-'
            + Math.round(((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) + 1 ) / that.dataSteps) * 100) / 100);
      })
      .on('mouseout', function() { tooltip.style('display', 'none');
      });

      this.chart.selectAll('.handle')
      .on('mousemove', function(event: any, d: any) {
        tooltip
          .select('text')
          .text(
            Math.round((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) / that.dataSteps) * 100) / 100
              + '-'
              + Math.round(((Math.floor(d3.pointer(event)[0] / (that.width / that.dataSteps)) + 1 ) / that.dataSteps) * 100) / 100);
      });

      if (init && this.selectionService.featureFilters.length != 0) {
        var min: number = 0, max: number = 0;
        this.selectionService.featureFilters.forEach(d => {
          if (d.featureName == this.property) {
            min = Math.floor(d.minValue*this.width+1);
            max = Math.floor(d.maxValue!*this.width-1);
            this.activeFilterInConfiguration = d;
          }
        });
        this.propertyInConfiguration = this.property;
        this.brush.move(this.chart.select('#overlay-wrap'), [min, max]);
        this.selectionService.filterRefresh();
        this.onLayoutChange();
        this.updateChart();
      }
    }
    };

  private removeFilterFromConfiguration(): void {
    if (this.activeFilterInConfiguration == null) { return; }

    const featureFilters = this.selectionService.featureFilters;
    const activeIndex = featureFilters.indexOf(this.activeFilterInConfiguration);
    this.activeFilterInConfiguration = undefined;
    featureFilters.splice(activeIndex, 1);
    this.onLayoutChange();
  };

  public clearFilter() {
    if (this.activeFilterInConfiguration == null) { return; }

    this.brushMin = -1;
    this.brushMax = -1;
    this.chart.selectAll('.bar').style('fill',  (d: any) => this.colorDecision(d));
    this.removeFilterFromConfiguration();
    this.chart.select('#overlay-wrap').call(this.brush.move, null);
    this.selectionService.filterRefresh();
    this.updateChart();
  }

  public onLayoutChange() {
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  // coloring for selected bars in histograms
  private brushed(event: any) {
    if (event === undefined || event.selection === undefined || event.selection === null) {
      return;
    }

    const x = d3.scaleLinear()
      .domain(this._data.map((d: any) => d[0]))
      .range([0, this.width])
    const selection: any[] = event.selection.map(x.invert, x);
    this.brushMin = +d3.min(selection) * this.dataSteps;
    this.brushMax = Math.floor(+d3.max(selection) * this.dataSteps);
    this.chart.selectAll('.bar').style('fill',  (d: any) => this.colorDecision(d));
  }

  private colorDecision(d: any) {
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
    .style('fill', (d: any) => this.colorDecision(d));
  }

  private toggleGroupState = (payload: [string, boolean]) => {
    if (this.configuration!.configurations[0].featureGroups[payload[0]].member.indexOf(this.property) > -1) {
      this.configuration!.configurations[0].activeFeatures[this.configuration!.configurations[0].activeFeatures.indexOf(this.object)].active = payload[1];
      this.active = payload[1];
      this.updateColoring();
      this.eventAggregator.getEvent(RefreshConfigEvent).publish(true);
      this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
    }
  } 

}
