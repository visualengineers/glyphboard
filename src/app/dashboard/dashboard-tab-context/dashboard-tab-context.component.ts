import { Component, OnInit, Injector } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { RefreshConfigEvent } from 'app/shared/events/refresh-config.event';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dashboard-tab-context',
  templateUrl: './dashboard-tab-context.component.html',
  styleUrls: ['./dashboard-tab-context.component.scss']
})
export class DashboardTabContextComponent extends DashboardTabComponent implements OnInit {
  public eventsSubject: Subject<void> = new Subject<void>();

  constructor(injector: Injector) {
    super(injector)

    this.eventAggregator
      .getEvent(RefreshConfigEvent)
      .subscribe(this.onRefreshConfig);
   }

  ngOnInit() {
  }

  private onRefreshConfig = (payload: boolean) => {
    this.eventsSubject.next();
  }
}
