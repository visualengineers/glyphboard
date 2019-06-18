import { PubSubEvent } from './pub-sub-event';

export class RefreshSelectionEvent extends PubSubEvent<boolean> {
    // No implementation required
    public eventType = 'RefreshSelectionEvent';
}
