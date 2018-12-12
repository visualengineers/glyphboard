import { PubSubEvent } from './pub-sub-event';

export class RefreshPlotEvent extends PubSubEvent<boolean> {
    // No implementation required
    public eventType = 'RefreshPlotEvent';
}
