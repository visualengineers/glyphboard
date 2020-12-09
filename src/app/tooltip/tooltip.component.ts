import { OnInit, ElementRef,  ViewChild,   Component } from '@angular/core';
import { Helper } from 'app/glyph/glyph.helper';
import { Configuration } from 'app/shared/services/configuration.service';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {
  @ViewChild('tooltip') private tooltipContainer: ElementRef;

  public tooltipElement: any;
  private _data: any;
  private closestPoint: any;
  private _values: any[] = [];

  private title = '';

  private _x = -1;
  private _y = -1;

  private _isVisible = false;
  private _isFixed = false;
  private _isEdit = false;
  private _tolerance = -1;
  public isActive = true;

  private readonly cursorOffset = 5;

  constructor(private helper: Helper, private configuration: Configuration) {}

  ngOnInit(): void {
    this.tooltipElement = this.tooltipContainer.nativeElement;
  }

  public updateClosestPoint(event: any, transform: any): void {
    if (this._data === undefined) { return; }

    let closestPoint: any;
    let closestDistance = Infinity;

    const clientX: number = event.clientX;
    const clientY: number = event.clientY;

    let dx: number, dy: number, distance: number;

    const tooltipHeight = this.tooltipElement.offsetHeight;
    const tooltipWidth = this.tooltipElement.offsetWidth;
    this._isVisible = false;
    this._x = clientX + tooltipWidth > window.innerWidth
      ? clientX - tooltipWidth - this.cursorOffset < 4
        ? 4
        : clientX - tooltipWidth - this.cursorOffset
      : clientX + this.cursorOffset;
    this._y = clientY + tooltipHeight > window.innerHeight
      ? clientY - tooltipHeight - this.cursorOffset < 4
        ? 4
        : clientY - tooltipHeight - this.cursorOffset
      : clientY + this.cursorOffset;
    this._values = [];

    this._data.positions.forEach(d => {
      // ignore invisible points
      if (this.helper.checkClipping(d.position)) {
        return;
      }

      dx = d.position.x - event.offsetX;
      dy = d.position.y - event.offsetY;

      distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) {
        if ((this.configuration.configurations[0].currentLevelOfDetail === 0 && distance <= 3.5)
          || this.configuration.configurations[0].currentLevelOfDetail === 1 && distance <= 20
          || this.configuration.configurations[0].currentLevelOfDetail > 1 && distance <= 50
          || (this.tolerance > 0 && distance <= this.tolerance)) {

          closestDistance = distance;
          closestPoint = d;
        }
      }
    });

    // member variable is undefined if no datapoint matches the criteria

    if (closestPoint !== undefined && closestPoint != null) {
      this.closestPoint = this._data.features.find(item => item.id === closestPoint.id);
      this.title = `ID: ${closestPoint.id}`;
      const context = this.configuration.configurations[0].globalFeatureContext;

      let label: string;
      for (const property in this._data.schema.tooltip) {
        if (this._data.schema.tooltip.hasOwnProperty(property)) {
          label = this._data.schema.tooltip[property];
          if (this.closestPoint.values !== undefined) {
            const value = this.closestPoint.values[label] + ' (' + parseFloat(this.closestPoint.features[context][label]).toFixed(4) + ')';
            this._values.push([this._data.schema.label[label], value]);
          }
        }
      }
      this.isActive = true;
      this._isVisible = true;
    }
  }

  public saveChanges(e: any): void {
    this.isEdit = !this.isEdit;
  }

  get x(): number { return this._x; }
  set x(left: number) { this._x = left; }

  get y(): number { return this._y; }
  set y(top: number) { this._y = top; }

  get tolerance(): number { return this._tolerance; }
  set tolerance(tolerance: number) { this._tolerance = tolerance; }

  get isVisible(): boolean { return this._isVisible; }
  set isVisible(flag: boolean) { this._isVisible = flag; }

  get isFixed(): boolean { return this._isFixed; }
  set isFixed(flag: boolean) {
    if (!flag) { this._isEdit = false; }
    this._isFixed = flag;
  }

  get isEdit(): boolean { return this._isEdit; }
  set isEdit(flag: boolean) { this._isEdit = flag; }

  set data(datum: any) { this._data = datum; }
  get data(): any { return this._data; }

  get getClosestPointId(): any {return this.closestPoint.id}
 
  get values(): any[] { return this._values; }
}
