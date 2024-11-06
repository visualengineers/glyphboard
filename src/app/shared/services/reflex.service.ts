import { Injectable } from '@angular/core';
import { Logger } from './logger.service';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { TouchPoint3d } from '../data/reflex.references';

@Injectable({
  providedIn: 'root'
})
export class ReFlexService {

  private touchPoints= new BehaviorSubject<Array<TouchPoint3d>>([]);
  private isConnected = new BehaviorSubject<boolean>(false);
  private eventCount = new BehaviorSubject<number>(0)

  public get currentTouches$(): Observable<Array<TouchPoint3d>> {
    return this.touchPoints.asObservable();
  }

  public get isConnected$(): Observable<boolean> {
    return this.isConnected.asObservable();
  }

  public constructor(
    private readonly logger: Logger
  ) {

  }

  public connectToWebSocket() {
    try {
      const websocket = new WebSocket (environment.reflexAddress);
      const that = this;

      websocket.onopen = (e: any) => {
        this.isConnected.next(true);
      };

      websocket.onmessage = (e: any) => {
        that.eventCount.next(that.eventCount.getValue() + 1);
        // todo: handle events
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
}
