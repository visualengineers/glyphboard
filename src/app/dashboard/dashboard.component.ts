import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef
} from '@angular/core';

import { Logger } from 'app/shared/services/logger.service';
import { Configuration } from 'app/shared/services/configuration.service';
import { DashboardGlyphConfigComponent } from './dashboard-tab-glyphs/dashboard-glyph-config.component';
import { LenseCursor } from 'app/lense/cursor.service';
import { RegionManager } from 'app/region/region.manager';
import { DataproviderService } from 'app/shared/services/dataprovider.service';
import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';
import * as d3 from 'd3';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') private container: ElementRef;
  @ViewChild('dashboard') private dashboard: ElementRef;
  @ViewChild('icon') private icon: ElementRef;
  @ViewChildren(DashboardGlyphConfigComponent) configOptions: QueryList<any>;

  // holds all options for glyph configurations, which are used to generate
  // the checkboxes in the settings
  public activeOptions: [any];
  public selectedFeatureName: string;

  // allows for tabbing. 'glyphs' shows glyph-options, 'settings' shows
  // global settings like split-view, magic-lens or zoom, etc.
  public activeTab = 'data';

  constructor(
    private logger: Logger,
    public configuration: Configuration,
    public cursor: LenseCursor,
    private regionManager: RegionManager,
    private dataProvider: DataproviderService,
    private eventAggregator: EventAggregatorService
  ) {}

  ngOnInit(): void {
    this.dataProvider.getDataSet().subscribe(message => {
      if (message == null) {
        return;
      }

      // set the dataset for the appropriate configuration object (either 0 or 1)
      this.configuration.configurations[this.configuration.dataSetRequest].setData(message);
      this.configuration.configurations[this.configuration.dataSetRequest].activeDataSet = message;
      this.configuration.configurations[this.configuration.dataSetRequest].featureGroups = message.schema.groups;
      
      // get the list of contexts that each feature has. Set the list to the appropriate variable
      const unorderedContexts: any = message.schema['variant-context'];
      const orderedContexts: Array<any> = [];
      for (const key in unorderedContexts) {
        if (unorderedContexts.hasOwnProperty(key)) {
          orderedContexts.push(unorderedContexts[key]);
        }
      }

      this.configuration.configurations[this.configuration.dataSetRequest].featureContexts = orderedContexts;
      this.configuration.configurations[this.configuration.dataSetRequest].selectedContext = orderedContexts[0];

      // initially set all features in the data as active
      this.configuration.configurations[this.configuration.dataSetRequest].activeFeatures = [];
      this.configuration.configurations[this.configuration.dataSetRequest].featureGroups = message.schema.groups;

      // Histograms should show all the features not only glyphs...
      for (const key in message.schema.label) {
        if (message.schema.label.hasOwnProperty(key)) {
          if (message.meta.features.hasOwnProperty(key)) {
            const value = message.schema.label[key];
            if (message.schema.glyph.includes(key)) {
              this.configuration.configurations[this.configuration.dataSetRequest].activeFeatures.push({
                active: true,
                property: key,
                label: value
              });
            } else {
              this.configuration.configurations[this.configuration.dataSetRequest].activeFeatures.push({
                active: false,
                property: key,
                label: value
              });
            }
          }
        }
      }

      const colorFeature = message.schema.color;
      this.configuration.configurations[
        this.configuration.dataSetRequest
      ].selectedFeatureName = message.schema.label[colorFeature];
    });

    this.configuration.splitScreenActive = this.regionManager.regions[1].display === 'block';

    // make sure lens can move over full window width when activated by setting its boundaries to
    // the width of the window
    if (this.regionManager.regions[1].display === 'block') {
      this.cursor.boundaries.right = window.innerWidth / 2;
    } else {
      this.cursor.boundaries.right = window.innerWidth;
    }
  }

  ngAfterViewInit(): void {}

  /**
   * Switch between the dashboard-tabs ('glyphs' and 'settings')
   * @param {any} e the onClick event for the HTML-anchors
   */
  public onTabToggle(e: any): void {
    e.preventDefault();
    this.activeTab = e.target.getAttribute('value');
  }

  private onColorChange(e: any): void {
    this.configuration.configurations[0].activeDataSet.schema.color = e.property;
    this.selectedFeatureName = this.configuration.configurations[0].activeDataSet.schema.label[e.property];
    this.onLayoutChange();
  }

  /**
   * Show/hide the dashboard itself.
   * @param  {any}    event The onClick event for the HTML-anchor.
   */
  public onToggleDashboard(event: any): void {
    event.preventDefault(); // suppress redirecting to anchor href

    // get d3 selections for the dashboard and the icon
    const dash: any = d3.select(this.dashboard.nativeElement);
    const ic: any = d3.select(this.icon.nativeElement);
    // current display status of dashboard
    const display: string = dash.style('display');

    if (display === 'block') {
      dash
        .transition()
        .style('width', '0px')
        .transition()
        .style('display', 'none');
      ic.transition().style('display', 'block');
    } else {
      dash
        .transition()
        .style('width', '395px')
        .style('display', 'block');
      ic.transition().style('display', 'none');
    }
  }

  public onLayoutChange() {
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }
}
