import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { EventAggregatorService } from '../events/event-aggregator.service';

import * as d3 from 'd3';
import { ManualZoom } from '../events/manual-zoom.event';

@Component({
  selector: 'app-doubleslider',
  templateUrl: './double_slider.component.html',
  styleUrls: ['./double_slider.component.scss']
})

export class DoubleSliderComponent implements OnInit {
  public min = 0;
  public max = 237;

  public lowerBound: number = this.min;
  public upperBound: number = this.max;

  public draggingMin = false;
  public draggingMax = false;
  public draggingIndicator = false;

  @Input() currentValue: number;
  @Output() onChange = new EventEmitter<any>();

  static dragging(component: DoubleSliderComponent, slider: string): void {
    if (slider === 'min') {
      component.draggingMin = true;
      component.lowerBound = Math.min(Math.max(d3.event.x, component.min), component.upperBound - 10);
      component.onChange.emit({ 'slider': 0, 'value': component.lowerBound * 20 / 50 / component.max });
    } else if (slider === 'max') {
      component.draggingMax = true;
      component.upperBound = Math.max(Math.min(d3.event.x, component.max), component.lowerBound + 10);
      component.onChange.emit({ 'slider': 1, 'value': component.upperBound * 20 / 50 / component.max });
    } else if (slider === 'indicator') {
      component.draggingIndicator = true;
      component.currentValue = Math.min(Math.max(((d3.event.x) / component.max) * 20, 0.5 ), ((component.max - 8.66) / component.max) * 20);
      component.eventAggregator.getEvent(ManualZoom).publish(component.currentValue);
    }
  }

  constructor(
    private eventAggregator: EventAggregatorService
    ) {
    // TODO: HARD CODED LEVELS OF DETAIL
    this.lowerBound = 0.2 * this.max;
    this.upperBound = 0.5 * this.max;
  }

  ngOnInit(): void {
    const that = this;

    d3.select('.slider.min')
      .call(d3.drag()
        .on('drag', () => DoubleSliderComponent.dragging(that, 'min'))
        .on('end', () => this.draggingMin = false)
      );
    d3.select('.slider.max')
      .call(d3.drag()
        .on('drag', () => DoubleSliderComponent.dragging(that, 'max'))
        .on('end', () => this.draggingMax = false)
      );
      d3.select('.indicator')
        .call(d3.drag()
          .on('drag', () => DoubleSliderComponent.dragging(that, 'indicator'))
          .on('end', () => this.draggingIndicator = false)
        );
  }
};
