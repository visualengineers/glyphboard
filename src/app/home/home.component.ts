import { Component, OnInit, HostListener } from '@angular/core';
import { DataproviderService } from '../shared/services/dataprovider.service';
import { RegionManager } from '../region/region.manager';
import { Logger } from '../shared/services/logger.service';
import { VisualizationType, SwitchVisualizationEvent } from 'src/app/shared/events/switch-visualization.event';
import { Configuration } from 'src/app/shared/services/configuration.service';
import { LenseCursor } from 'src/app/lense/cursor.service';
import { EventAggregatorService } from 'src/app/shared/events/event-aggregator.service';
import { RefreshPlotEvent } from 'src/app/shared/events/refresh-plot.event';
import { UpdateZoomIdentityEvent } from 'src/app/shared/events/update-zoom-identity.event';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  providers: [ DataproviderService, Logger, RegionManager ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private splitScreen: boolean = false;
  private isKeyDown: boolean = false;

  constructor(
    private logger: Logger,
    public regionManager: RegionManager,
    private configuration: Configuration,
    private cursor: LenseCursor,
    private eventAggregator: EventAggregatorService) {
    this.regionManager.addRegion('glyphs', 0, 0.8, true);
    this.regionManager.addRegion('glyphs2', 0.5, 0.8, false);
    this.regionManager.addRegion('features', 0, 0, false);
    this.regionManager.addRegion('webgl', 0, 0, false);
    this.regionManager.addRegion('webgl2', 0, 0, false);

    this.eventAggregator.getEvent(SwitchVisualizationEvent).subscribe(this.onVisualizationTypeChanged);
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
      case 'µ':
        // Magic Lens mode
        if (e.altKey && e.type === 'keyup') {
          this.cursor.toggle(true);
          this.configuration.configurations[0].useDragSelection = false;
          this.configuration.configurations[1].useDragSelection = false;
        }
        break;
      case 'p':
      case 'π':
        // Zooming and panning mode
        if (e.altKey && e.type === 'keyup') {
          this.activatePanningMode();
        }
        break;
      case 's':
      case '‚':
        // Selection mode
        if (e.altKey && e.type === 'keyup') {
          this.activateSelectionMode();
        }
        break;
      case '3':
      case '¶':
        // Switch for Region 4 for WebGL Glyphplot, disable D3 Glyphplot
        if (e.type === 'keyup') {
          if(this.regionManager.IsD3Active()) {
            this.eventAggregator.getEvent(SwitchVisualizationEvent).publish(VisualizationType.ThreeJS);
          } else {
            this.eventAggregator.getEvent(SwitchVisualizationEvent).publish(VisualizationType.D3);
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

  private onVisualizationTypeChanged = (type: VisualizationType) => {
    this.regionManager.regions![3].display = type === VisualizationType.ThreeJS ? 'block' : 'none';
    this.regionManager.regions![0].display = type === VisualizationType.D3 ? 'block' : 'none';

    if(this.regionManager.IsSplitScreen()){
      this.regionManager.regions![4].display = type === VisualizationType.ThreeJS ? 'block' : 'none';
      this.regionManager.regions![1].display = type === VisualizationType.D3 ? 'block' : 'none';
    }
    this.onResize();
  }
}
