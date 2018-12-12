import { EventBase } from './event-base';

export class Event {
    constructor(public eventType: string, public eventBase: EventBase) {
        this.eventType = eventType;
        this.eventBase = eventBase;
    }
}
