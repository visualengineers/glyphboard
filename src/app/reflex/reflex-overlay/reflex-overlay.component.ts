import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { InteractiveTouchPoint, PointVisualization as TouchPointVisualization } from 'src/app/shared/data/reflex.references';
import { ReFlexService } from 'src/app/shared/services/reflex.service';

@Component({
  selector: 'app-reflex-overlay',
  templateUrl: './reflex-overlay.component.html',
  styleUrls: ['./reflex-overlay.component.scss']
})
export class ReflexOverlayComponent implements OnInit, OnDestroy {

  public interactions: Array<TouchPointVisualization> = [];

  private subscriptions = new Subscription();

  @ViewChild('container')
  private containerElement?: ElementRef;

  public constructor(private readonly reflex: ReFlexService) {

  }

  public ngOnInit(): void {
    const sub = this.reflex.interactions$.subscribe({
      next: (values) => this.updateTouchPoints(values)
    });

    this.subscriptions.add(sub);
  }

  public ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
  }

  private updateTouchPoints(newPoints: Array<InteractiveTouchPoint>) {
    const w = this.containerElement?.nativeElement?.offsetWidth ?? 0;
    const h = this.containerElement?.nativeElement?.offsetHeight ?? 0;

    const transformed = newPoints.map((p) => ({
      interaction: p,
      screenPositionX: p.originalPoint.Position.X * w,
      screenPositionY: p.originalPoint.Position.Y * h,
    }));

    this.interactions = transformed;

  }
}
