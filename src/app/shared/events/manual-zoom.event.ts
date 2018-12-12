import { PubSubEvent } from './pub-sub-event';

export class ManualZoom extends PubSubEvent<number> {
    // No implementation required
    public eventType = 'ManualZoom';
}
