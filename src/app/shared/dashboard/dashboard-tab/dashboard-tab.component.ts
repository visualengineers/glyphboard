import { Component, Injector } from '@angular/core';
import { Logger } from '../../../logger.service';
import { Configuration } from '../../glyphplot/configuration.service';
import { DataproviderService } from '../../../dataprovider.service';
import { EventAggregatorService } from '../../events/event-aggregator.service';
import { RefreshPlotEvent } from '../../events/refresh-plot.event';
import { RegionManager } from '../../../home/region.manager';
import { LenseCursor } from '../../lense/cursor.service';
import { RefreshConfigEvent } from '../../events/refresh-config.event';

@Component({
  selector: 'app-dashboard-tab',
  templateUrl: './dashboard-tab.component.html',
  styleUrls: ['./dashboard-tab.component.scss']
})
export class DashboardTabComponent {
  protected logger: Logger;
  public configuration: Configuration;
  protected dataProvider: DataproviderService;
  protected eventAggregator: EventAggregatorService;
  protected regionManager: RegionManager;
  protected cursor: LenseCursor;

  constructor(injector: Injector) {
    this.logger = injector.get(Logger);
    this.configuration = injector.get(Configuration);
    this.dataProvider = injector.get(DataproviderService);
    this.eventAggregator = injector.get(EventAggregatorService);
    this.regionManager = injector.get(RegionManager);
    this.cursor = injector.get(LenseCursor);
  }

  protected onLayoutChange() {
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  protected onConfigChange() {
    this.eventAggregator.getEvent(RefreshConfigEvent).publish(true);
  }
}
