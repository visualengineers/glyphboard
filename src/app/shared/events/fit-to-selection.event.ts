import { PubSubEvent } from './pub-sub-event';

export class FitToSelectionEvent extends PubSubEvent<string> {
    // No implementation required
    public override eventType = 'FitToSelectionEvent';
}
