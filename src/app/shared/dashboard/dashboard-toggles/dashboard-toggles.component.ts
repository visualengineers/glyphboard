import { Component, OnInit } from '@angular/core';
import { LenseCursor } from '../../lense/cursor.service';
import { Configuration } from '../../glyphplot/configuration.service';
import { EventAggregatorService } from '../../events/event-aggregator.service';
import { RefreshPlotEvent } from '../../events/refresh-plot.event';

@Component({
  selector: 'app-dashboard-toggles',
  templateUrl: './dashboard-toggles.component.html',
  styleUrls: ['./dashboard-toggles.component.scss']
})
export class DashboardTogglesComponent implements OnInit {

  constructor(public cursor: LenseCursor, public configuration: Configuration, private eventAggregator: EventAggregatorService) { }

  ngOnInit() {
  }

  /**
   * Switch between the interaction techniques magic lens and zoom.
   * @param {any} e The onChange event for HTML-radiobuttons
   */
  public onInteractionToggle(e: any): void {
    this.cursor.toggle(e.srcElement.value === 'magiclens');
    this.configuration.configurations[0].useDragSelection = e.srcElement.value === 'selection';
    this.configuration.configurations[1].useDragSelection = e.srcElement.value === 'selection';
    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

}
