import { Injectable } from '@angular/core';
import { Logger } from './logger.service';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ExtremumType, InteractiveTouchPoint, TouchInteractionMode, TouchPoint3d, TouchPointVelocityDescription, TouchPointVelocityMap } from '../data/reflex.references';
import { dir } from 'console';
import { EventAggregatorService } from '../events/event-aggregator.service';
import { FitToScreenEvent } from '../events/fit-to-screen.event';
import { sort } from 'd3';

@Injectable({
  providedIn: 'root'
})
export class ReFlexService {

  private readonly infoThreshold = 0.25;
  private readonly resetVelocityThreshold = 0.8;
  private readonly minConfidence = 5;
  private readonly maxConfidence = 30;

  private readonly maxInfoPanels = 2;


  private rawTouchPoints= new BehaviorSubject<Array<TouchPoint3d>>([]);
  private interactions = new BehaviorSubject<Array<InteractiveTouchPoint>>([]);
  private isConnected = new BehaviorSubject<boolean>(false);
  private eventCount = new BehaviorSubject<number>(0);

  private velocities: Array<TouchPointVelocityMap> = [];

  public get currentTouches$(): Observable<Array<TouchPoint3d>> {
    return this.rawTouchPoints.asObservable();
  }

  public get isConnected$(): Observable<boolean> {
    return this.isConnected.asObservable();
  }

  public get interactions$(): Observable<Array<InteractiveTouchPoint>> {
    return this.interactions.asObservable();
  }

  public constructor(
    private readonly logger: Logger,
    private readonly eventAggregator: EventAggregatorService
  ) {
    this.connectToWebSocket();
  }

  public connectToWebSocket() {
    try {
      const websocket = new WebSocket (environment.reflexAddress);
      const that = this;

      websocket.onopen = (e: any) => {
        that.isConnected.next(true);
      };

      websocket.onmessage = (e: any) => {
        that.eventCount.next(that.eventCount.getValue() + 1);
        try {
          const data = JSON.parse(e.data) as Array<TouchPoint3d>;
          that.processMessage(data);
        } catch (error) {
          this.logger.log(`${error}`);
        }
      };

      websocket.onerror = function (e) {
        that.isConnected.next(false);
      };

      websocket.onclose = function (e) {
        that.isConnected.next(false);
      };
    } catch (err) {
      this.logger.log('No Flexiwall Connection found.');
    }
  }

  private processMessage(touchPoints: Array<TouchPoint3d>): void {
    const result: Array<InteractiveTouchPoint> = [];

    const validPoints = touchPoints.filter((tp) => tp.Position.IsValid && !tp.Position.IsFiltered);

    this.rawTouchPoints.next(validPoints);

    const confidentPoints = validPoints.filter((tp) => tp.Confidence > this.minConfidence && tp.ExtremumDescription.Type !== ExtremumType.Undefined);

    this.updateVelocities(confidentPoints);

    const resetDetected = this.analyzeVelocities();

    if (resetDetected) {
      this.velocities = [];

      this.interactions.next([]);

      this.eventAggregator.getEvent(FitToScreenEvent).publish(true);
      return;
    }

    // find points with depth value lower than info threshold --> these are used for hovering
    const infoPoints = confidentPoints
      .filter((tp) => Math.abs(tp.Position.Z) < this.infoThreshold)
      .map((tp) => ({ originalPoint: tp, mode: TouchInteractionMode.Info, strength: 1, rotation: 0 }))
      .sort((tp1, tp2) => tp2.originalPoint.Confidence - tp1.originalPoint.Confidence)
      .slice(0, this.maxInfoPanels);

    result.push(...infoPoints);

    // all points with higher depth value
    let remainingPoints = confidentPoints.filter((tp) => Math.abs(tp.Position.Z) >= this.infoThreshold);

    // single  touch: zoom (no parallel hover + zoom; prevents also issues when adding the second finger for panning causing unwanted zoom actione)
    if (confidentPoints.length === 1 && remainingPoints.length === 1) {
      const interaction: InteractiveTouchPoint =
      {
        originalPoint: remainingPoints[0],
        mode: remainingPoints[0].Position.Z < 0
          ? TouchInteractionMode.ZoomIn
          : TouchInteractionMode.ZoomOut,
        strength: this.computeStrengthForZoom(remainingPoints[0]),
        rotation: 0
      };

      result.push(interaction);
    }

    if (remainingPoints.length > 2) {
      remainingPoints = this.selectSignificantPoints(remainingPoints);
    }

    remainingPoints = remainingPoints.sort((tp1, tp2) => Math.abs(tp2.Position.Z) - Math.abs(tp1.Position.Z));

    if (remainingPoints.length === 2) {
      const anchor: InteractiveTouchPoint =
      {
        originalPoint: remainingPoints[1],
        mode: TouchInteractionMode.PanAnchor,
        strength: 0,
        rotation: 0
      };
      const direction: InteractiveTouchPoint =
      {
        originalPoint: remainingPoints[0],
        mode: TouchInteractionMode.PanDirection,
        strength: this.computeStrengthForZoom(remainingPoints[0]),
        rotation: this.computeRotation(remainingPoints[1], remainingPoints[0])
      }

      result.push(anchor);
      result.push(direction);
    }

    this.interactions.next(result);
  }

  private selectSignificantPoints(touchPoints: Array<TouchPoint3d>): Array<TouchPoint3d> {

    if (touchPoints.length <=2) {
      return touchPoints;
    }

    return touchPoints
    // create tuples of { touchPoint, distanceToAllOtherPoints }
    .map((tp) => {
      // createList with other points
      const other = touchPoints.filter((p) => p.TouchId !== tp.TouchId);

      // compute sum of distances to that points
      const totalDistance = other.map((o) => this.distance(tp, o)).reduce((sum, current) => sum + current, 0);

      return { point: tp, dist: totalDistance };
    })
    // sort by this distance
    .sort((tp1, tp2) => tp1.dist - tp2.dist)
    // take the first two elements
    .slice(0,2)
    // map back to original point
    .map((tp) => tp.point);
  }

  private distance(src: TouchPoint3d, dest: TouchPoint3d): number {
    return Math.abs(dest.Position.X - src.Position.X) + Math.abs(dest.Position.Y - src.Position.Y);
  }

  private computeStrengthForZoom(touchPoint: TouchPoint3d): number {
    let scaledZoomRange = Math.max(1 - this.infoThreshold, 0.001);

    return (Math.abs(touchPoint.Position.Z) - this.infoThreshold) / scaledZoomRange;
  }

  private computeRotation(anchor: TouchPoint3d, target: TouchPoint3d) {
    const direction = { x: target.Position.X - anchor.Position.X, y: target.Position.Y - anchor.Position.Y };

    const xDir = { x: 1, y: 0 };

    const angleRad = Math.atan2(direction.y*xDir.x - direction.x*xDir.y, direction.x*xDir.x + direction.y*xDir.y);

    const angleDegree = (angleRad * 180) / Math.PI;

    return angleDegree;
  }

  private updateVelocities(confidentPoints: Array<TouchPoint3d>) : void {
    // remove all points with too high confidence
    const still_ok = confidentPoints.filter((p) => p.Confidence < this.maxConfidence);

    // remove all points that are not in the list anymore
    this.velocities = this.velocities.filter((value) => still_ok.find((p) => p.TouchId === value.touchId) !== undefined);

    const new_values = still_ok.map((p) => ({ touchId: p.TouchId, confidence: p.Confidence, zValue: p.Position.Z }));

    this.velocities.push(...new_values);
  }

  private analyzeVelocities(): boolean {
    const ids = [...new Set(this.velocities.map((p) => p.touchId))];

    let result = false;

    ids.forEach((id) => {
      const velocity = this.computeMaxVelocity(id);

      if (velocity.pos > this.resetVelocityThreshold && Math.abs(velocity.neg) > this.resetVelocityThreshold) {
        result = true;
        return;
      }

    });

    return result;
  }

  private computeMaxVelocity(id: number): TouchPointVelocityDescription {
    const sorted = this.velocities.filter((p) => p.touchId === id).sort((p1, p2) => p1.confidence -p2.confidence);
    let result: TouchPointVelocityDescription = {
      pos: 0,
      neg: 0
    };

    for (let i = 0; i < sorted.length-1; i++) {
      const diff = sorted[i+1].zValue - sorted[i].zValue;

      if (diff > 0) {
        result.pos += diff;
      } else {
        result.neg += diff;
      }
    }

    return result;
  }
}
