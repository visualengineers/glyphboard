import { PubSubEvent } from './pub-sub-event';

export class FitToScreenEvent extends PubSubEvent<boolean> {
    // No implementation required
    public eventType = 'FitToScreenEvent';
}
