import { PubSubEvent } from './pub-sub-event';

export class RefreshConfigEvent extends PubSubEvent<boolean> {
    // No implementation required
    public override eventType = 'RefreshConfigEvent';
}
