import { GlyphplotComponent } from './glyphplot.component';
import { LenseCursor } from '../lense/cursor.service';
import { ConfigurationData } from '../shared/services/configuration.data';
import { Logger } from 'app/shared/services/logger.service';
import { GlyphLayout } from '../glyph/glyph.layout';
import { FlexiWallTouchPoint } from 'app/shared/types/flexiWallTouchPoint';
import { FlexiWallPosition } from 'app/shared/types/flexiWallPosition';
import { Point } from 'app/shared/types/point';
import { RegionManager } from 'app/region/region.manager';
import { EventAggregatorService } from 'app/shared/events/event-aggregator.service';
import { SwitchVisualizationEvent, VisualizationType } from 'app/shared/events/switch-visualization.event';
import { delay } from 'q';

export class FlexiWallController {

  // number of events ignored for performance reasons
  private static readonly _eventFilter = 3;

  // defauilt offset which is used to pan the suface once (multiplied by depth)
  private static readonly panningOffset = 300;

  // defines the width of the border used for panning
  private static readonly panningBorder = new Point (0.2, 0.2);

  // couhnting variable for event filtering
  private static eventCount = 0;

  private urlFlexiwall = 'ws://localhost:8080/';

  private flexiLastX: number;
  private flexiLastY: number;
  private flexiLastZ: number;

  private flexiOffset = new Point(0, 0);

  constructor(private component: GlyphplotComponent,
    private logger: Logger,
    private cursor: LenseCursor,
    private configuration: ConfigurationData,
    private eventAggregator: EventAggregatorService) {
  }

  /**
   * Connect to Flexiwall Socket if present.
   * @return {void}
   */
  public doWebSocket(): void {
    try {
      const websocket = new WebSocket (this.urlFlexiwall);
      const component = this.component;
      const that = this;

      websocket.onopen = (e: any) => {
        component.suppressAnimations = true;
      };

      websocket.onmessage = (e: any) => {
        FlexiWallController.eventCount++;
        if (FlexiWallController.eventCount > FlexiWallController._eventFilter) {
          that.onMessage (e);
          FlexiWallController.eventCount = 0;
        }
      };

      websocket.onerror = (e: Event) => {
        component.suppressAnimations = true;
        this.logger.log('Websocket Error.');
      };

      websocket.onclose = (e: Event) => {
        component.suppressAnimations = true;
        this.logger.log('Websocket Closed: retrying in 2 Seconds...');
        this.waitAndRetryConnection();
      };

      this.eventAggregator.getEvent(SwitchVisualizationEvent).publish(VisualizationType.D3);

    } catch (err) {
      this.logger.log('No Flexiwall Connection found.');
    }
  }

  onMessage (event) {
    const touchPoints = JSON.parse(event.data);

    let data = new FlexiWallTouchPoint();
    touchPoints.forEach(pt => {
      if (!pt.Position.IsValid) {
        return;
      }

      var absData = Math.abs(data.Position.Z);
      var absPt = Math.abs(pt.Position.Z);

      if (absData < absPt)
      {
        data = new FlexiWallTouchPoint(
          new FlexiWallPosition(pt.Position.X, pt.Position.Y, pt.Position.Z, pt.Position.IsValid),
          pt.Type,
          pt.Confidence,
          pt.Time
        )
      }
    });

    if (!data.Position.IsValid) {
      return;
    }


    // if (data.Position.Z > 1300 || data.Position.Z < 1500) return;
    // this.logger.log("X " + data.Position.X + " Y " + data.Position.Y + " Z " + data.Position.Z);

    // Find out if there is a minimal push on the wall
    // Move the lense
    // if (data.Position.Z < -0.5 && this.cursor.isVisible)
    if (data.Position.Z > 0.1 && this.cursor.isVisible) {
      let deltaX = 0;
      let deltaY = 0;
      const moveX = Math.abs(this.flexiLastX - data.Position.X);
      const moveY = Math.abs(this.flexiLastY - data.Position.Y);
      // if (Math.abs(this.flexiLastX - data.Position.X) > 0.002)
      {
        deltaX = this.flexiLastX > data.Position.X ? moveX : -1 * moveX;
      }
      // if (Math.abs(this.flexiLastY - data.Position.Y) > 0.002)
      {
        deltaY = this.flexiLastY > data.Position.Y ? moveY : -1 * moveY;
      }

      const oldPosition = this.cursor.position;
      this.cursor.updateGlyphs = true;
      const newPosition = {
        left: oldPosition.left + deltaX,
        top: oldPosition.top + deltaY
      };
      this.cursor.position = newPosition;

      this.flexiLastZ = data.Position.Z;
      this.flexiLastY = data.Position.Y;
      this.flexiLastX = data.Position.X;
    }

    if (data.Position.Z > 0.1 && this.cursor.isVisible) {
      this.cursor.forceAnimateGlyphs = true;
      const currentPosition = this.cursor.position;
      this.cursor.position = currentPosition;
      console.log('Do force');
    }

    if (this.cursor.isVisible) {
      return; // no zoom when lense is active
    }

    let isPanning = false;

    if (data.Position.Z > 0.1) {

      if (data.Position.X < FlexiWallController.panningBorder.x) {
        this.flexiOffset.x -= FlexiWallController.panningOffset * data.Position.Z;
        isPanning = true;
      }

      if (data.Position.X > 1.0 - FlexiWallController.panningBorder.x) {
        this.flexiOffset.x += FlexiWallController.panningOffset * data.Position.Z;
        isPanning = true;
      }

      if (data.Position.Y < FlexiWallController.panningBorder.y) {
        this.flexiOffset.y -= FlexiWallController.panningOffset * data.Position.Z;
        isPanning = true;
      }

      if (data.Position.Y > 1.0 - FlexiWallController.panningBorder.y) {
        this.flexiOffset.y += FlexiWallController.panningOffset * data.Position.Z;
        isPanning = true;
      }
    }


    const zoomFactor = Math.abs(data.Position.Z) > 0.1 && !isPanning
      ? 1.0 - 0.2 * data.Position.Z
      : 1.0;
    // const zoomFactor = data.Position.Z < -0.5 ? 1.05 : data.Position.Z > 0.5 ? 0.95 : 1;
    const trans = this.component.transform;
    trans.k = trans.k * zoomFactor;
    // trans.x = (this.component.width / 2 - 10) - ((this.component.width / 2 - 10) * trans.k);
    // trans.y = (this.component.height / 2 - 130) - ((this.component.height / 2 - 130) * trans.k);

    trans.x = (this.component.width / 2 - 50) - ((this.component.width / 2 - 50) * trans.k) + this.flexiOffset.x;
    trans.y = (this.component.height / 2 + 80) - ((this.component.height / 2 + 80) * trans.k) + this.flexiOffset.y;

    if (trans.k <= 1) {
      this.flexiOffset = new Point(0, 0);
      trans.k = 1;
    }

    if (trans.k > 40) {
      return;
    }


    this.component.transform = trans;
    // this.logger.log('FlexTransform: ' + this.component.transform);
    this.configuration.updateCurrentLevelOfDetail(this.component.transform.k);
    this.configuration.currentLayout = GlyphLayout.Cluster;
    this.component.animate();
  }

  public async waitAndRetryConnection() {
    await delay(2000);

    this.doWebSocket();
  }
}
