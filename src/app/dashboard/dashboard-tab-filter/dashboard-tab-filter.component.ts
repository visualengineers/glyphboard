import { Component, OnInit, Injector, ViewChild, ElementRef } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import * as d3 from 'd3';
import { TextFilter } from 'app/shared/filter/text-filter';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { RefreshGroupsEvent } from '../../shared/events/refresh-groups.event';

@Component({
  selector: 'app-dashboard-tab-filter',
  templateUrl: './dashboard-tab-filter.component.html',
  styleUrls: ['./dashboard-tab-filter.component.scss']
})
export class DashboardTabFilterComponent extends DashboardTabComponent implements OnInit {
  @ViewChild('searchfield') private searchfield: ElementRef;

  public eventsSubject: Subject<void> = new Subject<void>();
  private _freeSearchFilter: TextFilter;
  private groups = [];
  private helper = 0;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    var that = this;
    this.dataProvider.getDataSet().subscribe(message => {
      if (message == null) { return; }
      Object.keys(message.schema.groups).forEach(function (groupId) {
        if (!that.groups.includes(message.schema.groups[groupId])){
          that.groups.push(message.schema.groups[groupId]);
        }
      });
    });
  }

  onChanges() {
  }

  private featuresInGroup(group: any): any {
    var featureGroup = [];
    this.configuration.configurations[0].activeFeatures.forEach( d => {
      if (group.member.indexOf(d.property) > -1) {
        featureGroup.push(d);
      }
    });
    return featureGroup;
  }

  private onColorChange(e: any): void {
    this.configuration.configurations.forEach(config => {
      config.activeDataSet.schema.color = e.property;
      config.selectedFeatureName = this.configuration.configurations[0].activeDataSet.schema.label[e.property];
    });
    this.onLayoutChange();
  }

  /**
   * Change which features are active/inactive whenever a feature is clicked on.
   * @param {any} e the onChange event for dashboard-feature-components
   */
  private onFeatureConfigChange(e: any): void {
    // keep at least two active features, so no need to fulfill code below if only 2 are active atm
    // and one of those is toggled
    if (this.configuration.configurations[0].activeFeatures.filter(f => f.active).length <= 2 && e.active) {
      return;
    }

    // toggle active state of clicked feature
    e.active = !e.active;

    // update accessors: only create accessors for "active" features
    const accessors = this.updateAccessors();

    this.configuration.flowerConfigs[1].accessors = accessors;
    this.configuration.flowerConfigs[2].accessors = accessors;
    this.configuration.starConfigs[1].accessors = accessors;
    this.configuration.starConfigs[2].accessors = accessors;

    // this.drawExampleGlyph();
    this.onConfigChange();
    this.onLayoutChange();
  }

  private updateAccessors(): any[] {
    const accessorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, 100]);

    const accessors = [];

    // create an accessor for every feature that is to be displayed in the glyph according to the
    // schema
    for (const key in this.configuration.configurations[0].activeFeatures) {
      if (this.configuration.configurations[0].activeFeatures.hasOwnProperty(key)) {
        const value = this.configuration.configurations[0].activeFeatures[key];
        if (value.active) {
          accessors.push(d => {
            return accessorScale(d[value.property]);
          });
        }
      }
    }

    return accessors;
  }

  public search(searchtext: string) {
    const myFilter = this._freeSearchFilter;
    _.remove(this.configuration.configurations[0].featureFilters, function(currentObject) {
      return currentObject === myFilter;
    });
    _.remove(this.configuration.configurations[1].featureFilters, function(currentObject) {
      return currentObject === myFilter;
    });
    if (searchtext === '' || searchtext === undefined) {
      this.onLayoutChange();
      return;
    }

    const searchStrings = [];
    searchStrings.push(searchtext);
    this._freeSearchFilter = new TextFilter(searchStrings);
    this.configuration.configurations[0].featureFilters.push(this._freeSearchFilter);
    this.configuration.configurations[1].featureFilters.push(this._freeSearchFilter);
    this.configuration.configurations[0].filterRefresh();
    this.configuration.configurations[1].filterRefresh();
    this.onLayoutChange();
  }

  public resetFilters() {
    this.searchfield.nativeElement.value = '';
    this.configuration.configurations[0].featureFilters.splice(0, this.configuration.configurations[0].featureFilters.length);
    this.configuration.configurations[1].featureFilters.splice(0, this.configuration.configurations[1].featureFilters.length);
    this.configuration.configurations[0].filterRefresh();
    this.configuration.configurations[1].filterRefresh();
    this.eventsSubject.next();
    this.onLayoutChange();
  }
}
