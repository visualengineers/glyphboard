import { PubSubEvent } from './pub-sub-event';
import { RefreshHoverEventData } from './refresh-hover.event.data';

export class RefreshHoverEvent extends PubSubEvent<RefreshHoverEventData> {
    // No implementation required
    public override eventType = 'RefreshHoverEvent';
}
