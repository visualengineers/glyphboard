import { PubSubEvent } from './pub-sub-event';
import { ViewportTransformationEventData } from './viewport-transformation.event.data';

export class ViewportTransformationEvent extends PubSubEvent<ViewportTransformationEventData>
{
    public eventType = 'ViewportTransformationEvent';
}