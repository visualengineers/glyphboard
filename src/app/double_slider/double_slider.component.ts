import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { EventAggregatorService } from 'src/app/shared/events/event-aggregator.service';
import * as d3 from 'd3';
import * as d3Drag from 'd3-drag';
import { ManualZoom } from 'src/app/shared/events/manual-zoom.event';
import { DashboardSplitScreenEvent } from 'src/app/shared/events/dashboard-split-screen.event';

@Component({
  selector: 'app-doubleslider',
  templateUrl: './double_slider.component.html',
  styleUrls: ['./double_slider.component.scss']
})

export class DoubleSliderComponent implements AfterViewInit {
  public min = 0;
  public max = 237;

  public lowerBound: number = this.min;
  public upperBound: number = this.max;
  public draggingPrimary: boolean = false;
  public draggingSecondary: boolean = false;

  public draggingMin = false;
  public draggingMax = false;
  public draggingIndicator = false;

  @Input() currentValuePrimary: number = 0;
  @Input() currentValueSecondary: number = 0;
  @Input() primaryID: string = "";
  @Input() secondaryID: string = "";
  @Output() onChange = new EventEmitter<any>();
  public splitScreenInactive = true;

  static dragging(event: any, component: DoubleSliderComponent, slider: string): void {
    if (slider === 'min') {
      component.draggingMin = true;
      component.lowerBound = Math.min(Math.max(event.x, component.min), component.upperBound - 10);
      component.onChange.emit({ 'slider': 0, 'value': component.lowerBound * 20 / 50 / component.max });
    } else if (slider === 'max') {
      component.draggingMax = true;
      component.upperBound = Math.max(Math.min(event.x, component.max), component.lowerBound + 10);
      component.onChange.emit({ 'slider': 1, 'value': component.upperBound * 20 / 50 / component.max });
    } else if (slider === 'primary') {
      component.draggingPrimary = true;
      component.currentValuePrimary = Math.min(Math.max(((event.x) / component.max) * 20, 0.5 ), ((component.max - 8.66) / component.max) * 20);
      component.eventAggregator.getEvent(ManualZoom).publish([component.currentValuePrimary, component.primaryID]);
    } else if (slider === 'secondary') {
      component.draggingSecondary = true;
      component.currentValueSecondary = Math.min(Math.max(((event.x) / component.max) * 20, 0.5 ), ((component.max - 8.66) / component.max) * 20);
      component.eventAggregator.getEvent(ManualZoom).publish([component.currentValueSecondary, component.secondaryID ]);
    }
  }

  constructor(
    private eventAggregator: EventAggregatorService
    ) {

    this.eventAggregator
      .getEvent(DashboardSplitScreenEvent)
      .subscribe(this.updateSplitScreenState);
    // TODO: HARD CODED LEVELS OF DETAIL
    this.lowerBound = 0.2 * this.max;
    this.upperBound = 0.5 * this.max;
  }

  ngAfterViewInit(): void {
    const that: DoubleSliderComponent = this;

    let sliderMinDrag: d3Drag.DragBehavior<SVGSVGElement, any, any | d3Drag.SubjectPosition>;
    sliderMinDrag = d3Drag.drag<SVGSVGElement, any>()
      .on('drag', (event: any) => {
        DoubleSliderComponent.dragging(event, that, 'min')
      })
      .on('end', (element: SVGSVGElement, event: any) => { that.draggingMin = false; });

    d3.select<SVGSVGElement, any>('.slider.min').call(sliderMinDrag);

    let sliderMaxDrag: d3Drag.DragBehavior<SVGSVGElement, any, any | d3Drag.SubjectPosition>;
    sliderMaxDrag = d3Drag.drag<SVGSVGElement, any>()
    .on('drag', (event: any) => DoubleSliderComponent.dragging(event, that, 'max'))
    .on('end', (event: any) => { that.draggingMax = false; });
    d3.select<SVGSVGElement, any>('.slider.max').call(sliderMaxDrag);

    let indicatorPrimaryDrag: d3Drag.DragBehavior<SVGSVGElement, any, any | d3Drag.SubjectPosition>;
    indicatorPrimaryDrag = d3Drag.drag<SVGSVGElement, any>()
    .on('drag', (event: any) => DoubleSliderComponent.dragging(event, that, 'primary'))
    .on('end', (event: any) => { that.draggingIndicator = false; });
    d3.select<SVGSVGElement, any>('.indicator.primary').call(indicatorPrimaryDrag);

    let indicatorSecondaryDrag: d3Drag.DragBehavior<SVGSVGElement, any, any | d3Drag.SubjectPosition>;
    indicatorSecondaryDrag = d3Drag.drag<SVGSVGElement, any>()
    .on('drag', (event: any) => DoubleSliderComponent.dragging(event, that, 'secondary'))
    .on('end', (event: any) => { that.draggingIndicator = false; });
    d3.select<SVGSVGElement, any>('.indicator.secondary').call(indicatorSecondaryDrag);
  }

  private updateSplitScreenState = (payload: boolean) => {
    this.splitScreenInactive = !payload;
  }
};
