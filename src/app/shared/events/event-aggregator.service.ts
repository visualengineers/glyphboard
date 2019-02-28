import { Injectable } from '@angular/core';
import { EventBase } from './event-base';
import { Event } from './event';

@Injectable()
export class EventAggregatorService {

    private eventArray: Array<Event> = [];

    public getEvent<T extends EventBase>(type: { new (): T; }): T {
        const instance: T = new type();

        let availableEvent = null;
        for (const key in this.eventArray) {
            if (this.eventArray.hasOwnProperty(key)) {
                if (this.eventArray[key].eventType === instance.eventType) {
                    availableEvent = this.eventArray[key];
                    break;
                }
            }
        }

        if (availableEvent) {
          return availableEvent.eventBase as T;
        }

        this.eventArray.push(new Event(instance.eventType, instance));
        return instance;
    }

    private activator<T>(type: { new (): T; }): T {
        return new type();
    }
}
