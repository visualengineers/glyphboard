import { PubSubEvent } from './pub-sub-event';

export class UpdateZoomIdentityEvent extends PubSubEvent<boolean> {
    // No implementation required
    public eventType = 'UpdateZoomIdentityEvent';
}