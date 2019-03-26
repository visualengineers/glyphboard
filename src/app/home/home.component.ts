import { Component, ElementRef, OnInit, HostListener, ViewChild } from '@angular/core';
import { DataproviderService } from '../dataprovider.service';
import { RegionManager } from './region.manager';
import { Logger } from '../logger.service';
import { Configuration } from 'app/shared/glyphplot/configuration.service';
import { LenseCursor } from 'app/shared/lense/cursor.service';
import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';
import { UpdateZoomIdentityEvent } from 'app/shared/events/update-zoom-identity.event';
import { RefreshPlotEvent } from 'app/shared/events/refresh-plot.event';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  providers: [ DataproviderService, Logger, RegionManager ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private splitScreen: boolean;
  private isKeyDown: boolean;

  constructor(
    private dataProvider: DataproviderService,
    private logger: Logger,
    public regionManager: RegionManager,
    private configuration: Configuration,
    private cursor: LenseCursor,
    private eventAggregator: EventAggregatorService) {
    this.regionManager.addRegion('glyphs', 0, 0.8, true);
    this.regionManager.addRegion('glyphs2', 0.5, 0.8, false);
    this.regionManager.addRegion('features', 0, 0, false);
    this.regionManager.addRegion('dataflow', 0, 0, false);
  }

  @HostListener('document:keyup', ['$event'])
  @HostListener('document:keydown', ['$event'])
  keypress(e: KeyboardEvent) {
    if (this.isKeyDown && e.type === 'keydown') {
      return;
    }
    if (e.type === 'keyup') {
      this.isKeyDown = false;
    } else {
      this.isKeyDown = true;
    }

    switch (e.key.toLowerCase()) {
      case 'control':
        if (e.type === 'keyup') {
          this.activatePanningMode();
        } else {
          this.activateSelectionMode();
        }
        break;
      case 'm':
        // Magic Lens mode
        if (e.altKey && e.type === 'keyup') {
          this.cursor.toggle(true);
          this.configuration.configurations[0].useDragSelection = false;
          this.configuration.configurations[1].useDragSelection = false;
        }
        break;
      case 'p':
        // Zooming and panning mode
        if (e.altKey && e.type === 'keyup') {
          this.activatePanningMode();
        }
        break;
      case 's':
        // Selection mode
        if (e.altKey && e.type === 'keyup') {
          this.activateSelectionMode();
        }
        break;
      case '3':
        // Switch for Region 4 for WebGL Glyphplot, disable D3 Glyphplot
        if (e.type === 'keyup') {
          const d3Glyphplot = this.regionManager.regions[0].display === 'block';

          if (d3Glyphplot) {
            this.splitScreen = this.regionManager.regions[1].display === 'block';
            this.regionManager.regions[0].display = 'none';
            this.regionManager.regions[1].display = 'none';
            this.regionManager.regions[4].display = 'visible';
          } else {
            this.regionManager.regions[0].display = 'block';
            this.regionManager.regions[1].display = this.splitScreen ? 'block' : 'none';
            this.regionManager.regions[4].display = 'none';
          }
        }
        break;
      default:
        return;
    }

    this.eventAggregator.getEvent(RefreshPlotEvent).publish(true);
  }

  activatePanningMode() {
    this.cursor.toggle(false);
    this.configuration.configurations[0].useDragSelection = false;
    this.configuration.configurations[1].useDragSelection = false;
  }

  activateSelectionMode() {
    this.cursor.toggle(false);
    this.configuration.configurations[0].useDragSelection = true;
    this.configuration.configurations[1].useDragSelection = true;
  }

  ngOnInit() {
    this.onResize(true);
  }

  onResize(init: boolean = false) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    if(!init){
      this.eventAggregator.getEvent(UpdateZoomIdentityEvent).publish(true);
    }
    this.regionManager.updateRegions(width, height);
  }
}
