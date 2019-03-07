import { ElementRef } from '@angular/core';

import { Helper } from '../glyph/glyph.helper';
import { Configuration } from '../shared/services/configuration.service';

import * as d3 from 'd3';

export class Tooltip {
    private data: any;
    private context: any;
    private tooltip: any = { x: -1, y: -1 };
    private closestPoint: any = { x: -1, y: -1 };

    constructor(private helper: Helper, private configurationService: Configuration) { }

    public setContext(context: any) {
        this.context = context;
    }

    public setData(data: any) {
        this.data = data;
    }

    /**
     * Takes the data from the closestPoint to and draws a box containing this
     * data next to the mousePosition
     */
    drawTooltip(): void {
        if (this.tooltip.x < 0 || this.tooltip.y < 0) {
          d3.select('#tooltip').style('display', 'none');
          return;
        }

        const x: number = this.tooltip.x + 15;
        const y: number = this.tooltip.y;

        const data = this.closestPoint;

        const tooltip: any = d3.select('#tooltip')
          .style('display', 'block')
          .style('left', `${x}px`)
          .style('top', `${y}px`);

        // clear previous data
        tooltip.selectAll('tr').remove();

        // title
        tooltip.select('h1').text(data.titel);

        const dataContainer: any = tooltip.select('table');

        let nextRow: any;
        let label: string;
        let value: any;

        for (const d in data) {
          // don't include coordinate-data
          if (d.match(/[xy]/) || d.match('titel')) {
              continue;
          }

          label = d.substring(0, 10);
          value = typeof data[d] === 'string'
              ? data[d].substring(0, 25)
              : Math.floor(data[d] * 100) / 100;

          if (value.length === 25) {
              value += '...';
          }

          nextRow = dataContainer.append('tr');
          nextRow.append('td')
            .style('font-weight', 'bolder')
            .style('padding', 0)
            .text(label);
            nextRow.append('td')
            .style('padding-left', '1.5rem')
            .text(value);
        }

    }

    /**
     * If the cursor hovers above a datapoint, set the tooltip coordinates next
     * to this datapoint
     */
    public updateTooltip(): void {
        if (typeof this.closestPoint === typeof undefined) {
            this.tooltip.x = -1;
            this.tooltip.y = -1;
        } else {
            this.tooltip.x = d3.event.clientX;
            this.tooltip.y = d3.event.clientY;
        }
    }

    /**
     * Find the data point that the mouse pointer currently points to.
     * Differentiate between circles and glyphs.
     */
    public updateClosestPoint(transform: any, chartContainer: ElementRef, xAxis: any, yAxis: any): void {
        let closestPoint: any;
        let closestDistance = Infinity;

        const clientX: number = d3.event.clientX;
        const clientY: number = d3.event.clientY;

        let dx: number, dy: number, distance: number;

        this.data.positions.forEach(d => {
            // ignore invisible points
            if (this.helper.checkClipping(d)) {
                return;
            }

            dx = d.position.x - d3.mouse(chartContainer.nativeElement)[0];
            dy = d.position.y - d3.mouse(chartContainer.nativeElement)[1];

            distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
                if ((transform.k < this.configurationService.configurations[0].maxZoom * 0.2 && distance <= 3.5)
                    || transform.k >= this.configurationService.configurations[0].maxZoom * 0.2 && distance <= 50) {

                    closestDistance = distance;
                    closestPoint = d.position;
                }
            }
        });

        // member variable is undefined if no datapoint matches the criteria
        this.closestPoint = closestPoint;
    }
}
