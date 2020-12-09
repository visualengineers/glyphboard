import { PubSubEvent } from './pub-sub-event';

export class ManualZoom extends PubSubEvent<any[]> {
    // No implementation required
    public eventType = 'ManualZoom';
}
