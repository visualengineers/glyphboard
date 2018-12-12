import { Component, OnInit, TemplateRef } from '@angular/core';
import { EventAggregatorService } from '../events/event-aggregator.service';
import { GlobalDialogEvent, GlobalDialogPayload } from '../events/global-dialog.event';

@Component({
  selector: 'app-global-dialog',
  templateUrl: './global-dialog.component.html',
  styleUrls: ['./global-dialog.component.scss']
})
export class GlobalDialogComponent implements OnInit {
  private _active = false;
  public dialogTemplateRef: TemplateRef<any>;
  public title: string;

  constructor(private eventAggregator: EventAggregatorService) { }

  ngOnInit() {
    this.eventAggregator.getEvent(GlobalDialogEvent).subscribe((payload: GlobalDialogPayload) => {
      if (payload.dto.visible) {
        this.title = payload.dto.title;
        this.dialogTemplateRef = payload.dto.content;
      }

      this.active = payload.dto.visible;
    });
  }

  public close() {
    this.active = false;
  }

  get active() { return this._active; }
  set active(value: boolean) { this._active = value; }
}
