import { PubSubEvent } from './pub-sub-event';

export class FitToSelectionEvent extends PubSubEvent<boolean> {
    // No implementation required
    public eventType = 'FitToSelectionEvent';
}
