import { Component, Injector } from '@angular/core';
import { Logger } from 'src/app/shared/services/logger.service';
import { Configuration } from 'src/app/shared/services/configuration.service';
import { DataproviderService } from 'src/app/shared/services/dataprovider.service';
import { EventAggregatorService } from 'src/app/shared/events/event-aggregator.service';
import { RefreshPlotEvent } from 'src/app/shared/events/refresh-plot.event';
import { RegionManager } from 'src/app/region/region.manager';
import { LenseCursor } from 'src/app/lense/cursor.service';
import { RefreshConfigEvent } from 'src/app/shared/events/refresh-config.event';

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
