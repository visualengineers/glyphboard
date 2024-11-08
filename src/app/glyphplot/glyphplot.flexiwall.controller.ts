import { GlyphplotComponent } from './glyphplot.component';
import { LenseCursor } from '../lense/cursor.service';
import { ConfigurationData } from '../shared/services/configuration.data';
import { Logger } from 'src/app/shared/services/logger.service';
import { GlyphLayout } from '../glyph/glyph.layout';
import { InteractiveTouchPoint, TouchInteractionMode } from '../shared/data/reflex.references';
import { ReFlexService } from '../shared/services/reflex.service';
import { Injectable, OnDestroy } from '@angular/core';
import { debounceTime, Subscription } from 'rxjs';
import * as d3 from 'd3';
import { EventAggregatorService } from '../shared/events/event-aggregator.service';
import { FitToScreenEvent } from '../shared/events/fit-to-screen.event';

@Injectable()
export class FlexiWallController implements OnDestroy {

  private subscriptions = new Subscription();

  private readonly panningSpeed = -15;
  private readonly wheelModifier = -20;

  private lastInteraction = TouchInteractionMode.None;

  private isReset = true;

  constructor(private component: GlyphplotComponent,
    private logger: Logger,
    private reflex: ReFlexService,
    private cursor: LenseCursor,
    private configuration: ConfigurationData,
    private eventAggregator: EventAggregatorService
  ) {
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

    const interactionSub = this.reflex.interactions$.pipe(
      debounceTime(20)
    ).subscribe({
      next: (interactions) => this.handleInteractions(interactions)
    });

    this.subscriptions.add(connectionSub);
    this.subscriptions.add(interactionSub);

    this.eventAggregator
      .getEvent(FitToScreenEvent)
      .subscribe(() => this.resetTransformation());
  };

  public ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
  }



  private handleInteractions(interactions: Array<InteractiveTouchPoint>): void {
    const zoom = interactions.find((i) => i.mode === TouchInteractionMode.ZoomIn || i.mode === TouchInteractionMode.ZoomOut);
    const anchor = interactions.find((i) => i.mode === TouchInteractionMode.PanAnchor);
    const target = interactions.find((i) => i.mode === TouchInteractionMode.PanDirection);
    const info = interactions.filter((i) => i.mode === TouchInteractionMode.Info);

    this.resetInfo();

    if (info.length > 0) {
      info.forEach((i, idx) => this.showInfo(i, idx));

      info.forEach((i, idx) => console.log(i, idx));
    }

    if (zoom) {
      const strength = zoom.mode === TouchInteractionMode.ZoomIn ? zoom.strength : -zoom.strength;
      this.updateZoom(strength, zoom.originalPoint.Position.X, zoom.originalPoint.Position.Y);

      return;
    }

    if (anchor && target) {
      this.updateTranslation(anchor, target, target.strength);

      return;
    }

    // if(!this.isReset && interactions.length > 0 && interactions[0].originalPoint.Position.Z > 0) {
    //   this.resetTransformation();

    //   return;
    // }

    this.lastInteraction = TouchInteractionMode.None;
  }

  private updateZoom(interactionStrength: number, x: number, y: number) : void {
    const screenOffset = { x: this.component.width * x, y: this.component.height * y};

    const wheelEvent = new WheelEvent('wheel', {
      deltaY: interactionStrength * this.wheelModifier,
      clientX: screenOffset.x,
      clientY: screenOffset.y
    });

    this.component.chartContainer?.nativeElement.dispatchEvent(wheelEvent);

    this.lastInteraction = interactionStrength > 0 ? TouchInteractionMode.ZoomIn : TouchInteractionMode.ZoomOut;
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


    this.component.configuration.zoomIdentity = trans;

    this.component.updateGlyphLayout();
    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.configuration.currentLayout = GlyphLayout.Cluster;
    this.component.animate();
  }

  private showInfo(target: InteractiveTouchPoint, idx: number) {
    const all = this.component.allToolTips;

    if (all.length <= idx) {
      return;
    }

    const tooltip = all[idx];
    if (!tooltip) {
      return;
    }


    tooltip.tolerance = 20;

    const screenOffset = { x: this.component.width * target.originalPoint.Position.X, y: this.component.height * target.originalPoint.Position.Y};

    const moveEvent = new MouseEvent('mousemove', {
      clientX: screenOffset.x,
      clientY: screenOffset.y
    });

    tooltip.updateClosestPoint(moveEvent, this.component.configuration.zoomIdentity);
  }

  private resetInfo() {
    const all = this.component.allToolTips;

    all.forEach((tooltip) => {

      if (!tooltip) {
        return;
      }

      tooltip.isVisible = false;
    });
  }

  private resetTransformation(): void {
    this.isReset = true;

    this.component.configuration.zoomIdentity = d3.zoomIdentity;

    this.configuration.updateCurrentLevelOfDetail(this.component.configuration.zoomIdentity.k);
    this.configuration.levelChanged();
    this.component.updateGlyphLayout(true);
    this.component.animate();
  }
}
