import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { EventBase } from './event-base';

@Injectable()
export class PubSubEvent<T> extends EventBase {

    private source = new Subject<T>();

    // Observable string streams
    private observable = this.source.asObservable();

    // Cache array of tuples
    private subscriptions: Array<[(a: T) => void, Subscription]> = [];

    subscribe(observer: (a: T) => void) {
        if (this.subscriptions.find(item => item[0] === observer) !== undefined) {
            return;
        }
        const subscription = this.observable.subscribe(observer);
        this.subscriptions.push([observer, subscription]);
    }

    publish(payload: T) {
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
