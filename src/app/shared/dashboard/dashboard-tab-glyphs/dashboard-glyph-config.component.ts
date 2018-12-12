import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'glyph-config-item',
  templateUrl: './dashboard-glyph-config.component.html',
  styleUrls: ['./dashboard-glyph-config.component.scss']
})

export class DashboardGlyphConfigComponent {
  @Input() label: string;
  @Input() property: string;
  @Input() active = false;

  @Output() onConfigChange = new EventEmitter<any>();

  public changed(): void {
    this.active = !this.active;
    this.onConfigChange.emit({
      property: this.property,
      active: this.active
    });
  }
}
