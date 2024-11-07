import { GlyphplotComponent } from './glyphplot.component';
import { LenseCursor } from '../lense/cursor.service';
import { ConfigurationData } from '../shared/services/configuration.data';
import { Logger } from 'src/app/shared/services/logger.service';
import { GlyphLayout } from '../glyph/glyph.layout';
import { environment } from 'src/environments/environment';
import { InteractiveTouchPoint, TouchInteractionMode, TouchPoint3d } from '../shared/data/reflex.references';
import { ReFlexService } from '../shared/services/reflex.service';
import { isContext } from 'vm';
import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, Subscription } from 'rxjs';
import * as d3 from 'd3';
import { EventAggregatorService } from '../shared/events/event-aggregator.service';
import { FitToScreenEvent } from '../shared/events/fit-to-screen.event';

@Injectable()
export class FlexiWallController implements OnDestroy {

  private subscriptions = new Subscription();

  private readonly panningSpeed = -5;

  private translationX = 0;
  private translationY = 0;

  private isReset = true;

  constructor(private component: GlyphplotComponent,
    private logger: Logger,
    private reflex: ReFlexService,
    private cursor: LenseCursor,
    private configuration: ConfigurationData,
    private eventAggregator: EventAggregatorService) {


  }

  /**
   * Connect to Flexiwall Socket if present.
   * @return {void}
   */
  public init(): void {
    const connectionSub = this.reflex.isConnected$.subscribe({
      next: (isConnected) => this.component.suppressAnimations = isConnected,
      complete: () => this.component.suppressAnimations = false,
      error:() => this.component.suppressAnimations = false
    });

    const interactionSub =this.reflex.interactions$.pipe(
      debounceTime(20)
    ).subscribe({
      next: (interactions) => this.handleInteractions(interactions)
    });

    this.subscriptions.add(connectionSub);
    this.subscriptions.add(interactionSub);

    // this.eventAggregator
    //   .getEvent(FitToScreenEvent)
    //   .subscribe(() => this.resetTransformation());
  };

  public ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
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

  private handleInteractions(interactions: Array<InteractiveTouchPoint>): void {
    const zoom = interactions.find((i) => i.mode === TouchInteractionMode.ZoomIn || i.mode === TouchInteractionMode.ZoomOut);
    const anchor = interactions.find((i) => i.mode === TouchInteractionMode.PanAnchor);
    const target = interactions.find((i) => i.mode === TouchInteractionMode.PanDirection);

    if (zoom) {
      const strength = zoom.mode === TouchInteractionMode.ZoomIn ? zoom.strength : -zoom.strength;
      this.updateZoom(strength, zoom.originalPoint.Position.X, zoom.originalPoint.Position.Y);

      return;
    }

    if (anchor && target) {
      this.updateTranslation(anchor, target, target.strength);
    }

    if(!this.isReset && interactions.length > 0 && interactions[0].originalPoint.Position.Z > 0) {
      this.resetTransformation();
    }
  }

  private updateZoom(interactionStrength: number, x: number, y: number) : void {
    this.isReset = false;

    const trans = this.component.configuration.zoomIdentity;

    const zoomFactor = (1.0 + (0.05 * interactionStrength)) * trans.k;
    const zoom = d3.zoomIdentity
      .translate(this.component.width * x, this.component.height * y)
      .scale(zoomFactor)
      .translate(-this.component.width * x + this.translationX, -this.component.height * y + this.translationY);
    this.component.configuration.zoomIdentity = zoom;

    // this.translationX = zoom.x;
    // this.translationY = zoom.y;

    this.component.updateGlyphLayout();
    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.configuration.currentLayout = GlyphLayout.Cluster;
    this.component.animate();
  }

  private updateTranslation(anchor: InteractiveTouchPoint, target: InteractiveTouchPoint, interactionStrength: number) : void {
    this.isReset = false;

    const dirX = target.originalPoint.Position.X - anchor.originalPoint.Position.X;
    const dirY = target.originalPoint.Position.Y - anchor.originalPoint.Position.Y;

    const l = Math.sqrt(dirX * dirX + dirY * dirY);

    const dirX_norm = dirX/l * this.panningSpeed;
    const dirY_norm = dirY/l * this.panningSpeed;

    const trans = this.component.configuration.zoomIdentity;
    trans.x = trans.x + dirX_norm * interactionStrength;
    trans.y = trans.y + dirY_norm * interactionStrength;

    // trans.k = trans.k * zoomFactor;
    // const zoom = d3.zoomIdentity.translate(this.component.width * x, this.component.height * y).scale(trans.k).translate(-this.component.width * x, -this.component.height * y);
    // this.component.configuration.zoomIdentity = zoom;

    this.component.configuration.zoomIdentity = trans;

    this.translationX = trans.x;
    this.translationY = trans.y;


    this.component.updateGlyphLayout();
    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.configuration.currentLayout = GlyphLayout.Cluster;
    this.component.animate();
  }

  private resetTransformation(): void {
    this.isReset = true;

    this.translationX = 0;
    this.translationY = 0;

    this.component.configuration.zoomIdentity = d3.zoomIdentity;

    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.configuration.levelChanged();
    this.component.updateGlyphLayout(true);
    this.component.animate();
  }

  private onlyTest() {
    const trans = this.component.configuration.zoomIdentity;
    trans.x = 10;
    trans.y = 10;

    // trans.k = trans.k * zoomFactor;
    // const zoom = d3.zoomIdentity.translate(this.component.width * x, this.component.height * y).scale(trans.k).translate(-this.component.width * x, -this.component.height * y);
    // this.component.configuration.zoomIdentity = zoom;

    this.component.configuration.zoomIdentity = trans;

    this.translationX = trans.x;
    this.translationY = trans.y;


    this.component.updateGlyphLayout(true);
    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.configuration.currentLayout = GlyphLayout.Cluster;
    this.component.animate();
  }
}
