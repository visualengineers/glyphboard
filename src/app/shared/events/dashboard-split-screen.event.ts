import { PubSubEvent } from './pub-sub-event';

export class DashboardSplitScreenEvent extends PubSubEvent<boolean> {
    // No implementation required
    public override eventType = 'DashboardSplitScreenEvent';
}
