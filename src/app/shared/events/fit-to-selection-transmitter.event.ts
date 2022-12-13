import { PubSubEvent } from './pub-sub-event';

export class FitToSelectionTransmitterEvent extends PubSubEvent<boolean> {
    // No implementation required
    public override eventType = 'FitToSelectionTransmitterEvent';
}
