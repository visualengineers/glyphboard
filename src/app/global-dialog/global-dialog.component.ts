import { AfterViewInit, Component, OnInit, TemplateRef } from '@angular/core';
import { EventAggregatorService } from 'src/app/shared/events/event-aggregator.service';
import { GlobalDialogEvent, GlobalDialogPayload } from 'src/app/shared/events/global-dialog.event';

@Component({
  selector: 'app-global-dialog',
  templateUrl: './global-dialog.component.html',
  styleUrls: ['./global-dialog.component.scss']
})
export class GlobalDialogComponent implements AfterViewInit {
  private _active = false;
  public dialogTemplateRef: TemplateRef<any> | null = null;
  public title: string | undefined;

  constructor(private eventAggregator: EventAggregatorService) { }

  ngAfterViewInit() {
    this.eventAggregator.getEvent(GlobalDialogEvent).subscribe((payload: GlobalDialogPayload) => {
      if (payload.dto.visible) {
        this.title = payload.dto.title;
        this.dialogTemplateRef = payload.dto.content;
      }
      
      this.active = payload.dto.visible;      
      console.log(this.active);
    });
    console.log(this.active);
  }

  public close() {
    this.active = false;
  }

  get active() { return this._active; }
  set active(value: boolean) { this._active = value; }
}
