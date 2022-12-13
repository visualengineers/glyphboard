import { PubSubEvent } from './pub-sub-event';

export class ToggleGroupEvent extends PubSubEvent<[string, boolean]> {
    // No implementation required
    public override eventType = 'ToggleGroupEvent';
}
