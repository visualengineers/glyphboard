import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Subscription } from 'rxjs';
import { EventBase } from './event-base';

@Injectable()
export class PubSubEvent<T> extends EventBase {

    protected source = new Subject<T>();

    // Observable string streams
    protected observable = this.source.asObservable();

    // Cache array of tuples
    protected subscriptions: Array<[(a: T) => void, Subscription]> = [];

    subscribe(observer: (a: T) => void) {
        if (this.subscriptions.find(item => item[0] === observer) !== undefined) {
            return;
        }
        const subscription = this.observable.subscribe(observer);
        this.subscriptions.push([observer, subscription]);
    }

    publish(payload: T): void {
        this.source.next(payload);
    }

    unsubscribe(observer: (a: T) => void) {
        const foundIndex = this.subscriptions.findIndex(item => item[0] === observer);
        if (foundIndex > -1) {
            const subscription: Subscription = this.subscriptions[foundIndex][1];
            subscription.unsubscribe();
            this.subscriptions.splice(foundIndex, 1); // removes item
        }
    }
}
