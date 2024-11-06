import { GlyphplotComponent } from './glyphplot.component';
import { LenseCursor } from '../lense/cursor.service';
import { ConfigurationData } from '../shared/services/configuration.data';
import { Logger } from 'src/app/shared/services/logger.service';
import { GlyphLayout } from '../glyph/glyph.layout';
import { environment } from 'src/environments/environment';
import { TouchPoint3d } from '../shared/data/reflex.references';
import { ReFlexService } from '../shared/services/reflex.service';
import { isContext } from 'vm';

export class FlexiWallController {



  constructor(private component: GlyphplotComponent,
    private logger: Logger,
    private reflex: ReFlexService,
    private cursor: LenseCursor,
    private configuration: ConfigurationData) {

      reflex.isConnected$.subscribe({
        next: (isConnected) => component.suppressAnimations = isConnected,
        complete: () => component.suppressAnimations = false,
        error:() => component.suppressAnimations = false
      });
  }

  /**
   * Connect to Flexiwall Socket if present.
   * @return {void}
   */
  public init(): void {

  }

  onMessage (event: any) {
    const data = JSON.parse(event.data) as Array<TouchPoint3d>;
    // if (data.Position.Z > 1300 || data.Position.Z < 1500) return;
    // this.logger.log("X " + data.Position.X + " Y " + data.Position.Y + " Z " + data.Position.Z);
    console.log('ReFlex: ', data);

    /*

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
    const trans = this.component.configuration.zoomIdentity;
    trans.k = trans.k * zoomFactor;
    // trans.x = (this.component.width / 2 - 10) - ((this.component.width / 2 - 10) * trans.k);
    // trans.y = (this.component.height / 2 - 130) - ((this.component.height / 2 - 130) * trans.k);

    trans.x = (this.component.width / 2 - 50) - ((this.component.width / 2 - 50) * trans.k);
    trans.y = (this.component.height / 2 + 80) - ((this.component.height / 2 + 80) * trans.k);

    if (trans.k < 1 || trans.k > 40) {
      return;
    }

    this.component.configuration.zoomIdentity = trans;
    // this.logger.log('FlexTransform: ' + this.component.transform);
    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.configuration.currentLayout = GlyphLayout.Cluster;
    this.component.animate();

    */
  }
}
