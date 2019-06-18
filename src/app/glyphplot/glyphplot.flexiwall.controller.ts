import { GlyphplotComponent } from './glyphplot.component';
import { LenseCursor } from '../lense/cursor.service';
import { ConfigurationData } from '../shared/services/configuration.data';
import { Logger } from 'app/shared/services/logger.service';
import { GlyphLayout } from '../glyph/glyph.layout';

export class FlexiWallController {

  private urlFlexiwall = 'ws://localhost:8080/Broadcast';

  private flexiLastX: number;
  private flexiLastY: number;
  private flexiLastZ: number;

  private eventCount = 0;

  constructor(private component: GlyphplotComponent,
    private logger: Logger,
    private cursor: LenseCursor,
    private configuration: ConfigurationData) {
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
        that.eventCount++;
        // if (that.eventCount > 5)
        {
          that.onMessage (e);
          that.eventCount = 0;
        }
      };

      websocket.onerror = function (e) {
        component.suppressAnimations = true;
      };

      websocket.onclose = function (e) {
        component.suppressAnimations = true;
      };
    } catch (err) {
      this.logger.log('No Flexiwall Connection found.');
    }
  }

  onMessage (event) {
    const data = JSON.parse(event.data);
    // if (data.Position.Z > 1300 || data.Position.Z < 1500) return;
    // this.logger.log("X " + data.Position.X + " Y " + data.Position.Y + " Z " + data.Position.Z);

    // Find out if there is a minimal push on the wall
    // Move the lense
    // if (data.Position.Z < -0.5 && this.cursor.isVisible)
    if (data.Position.Z < 1300 && this.cursor.isVisible) {
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
    if (data.Position.Z > 1280 && this.cursor.isVisible) {
      this.cursor.forceAnimateGlyphs = true;
      const currentPosition = this.cursor.position;
      this.cursor.position = currentPosition;
      console.log('Do force');
    }

    if (this.cursor.isVisible) {
      return; // no zoom when lense is active
    }

    const zoomFactor = data.Position.Z > 1500 ? 0.95 : data.Position.Z < 1200 ? 1.05 : 1;
    // const zoomFactor = data.Position.Z < -0.5 ? 1.05 : data.Position.Z > 0.5 ? 0.95 : 1;
    const trans = this.component.transform;
    trans.k = trans.k * zoomFactor;
    // trans.x = (this.component.width / 2 - 10) - ((this.component.width / 2 - 10) * trans.k);
    // trans.y = (this.component.height / 2 - 130) - ((this.component.height / 2 - 130) * trans.k);

    trans.x = (this.component.width / 2 - 50) - ((this.component.width / 2 - 50) * trans.k);
    trans.y = (this.component.height / 2 + 80) - ((this.component.height / 2 + 80) * trans.k);

    if (trans.k < 1 || trans.k > 40) {
      return;
    }

    this.component.transform = trans;
    // this.logger.log('FlexTransform: ' + this.component.transform);
    this.configuration.updateCurrentLevelOfDetail(this.component.transform.k);
    this.configuration.currentLayout = GlyphLayout.Cluster;
    this.component.animate();
  }
}
