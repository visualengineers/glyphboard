import { PubSubEvent } from './pub-sub-event';
import { InteractionEventData } from './interaction.event.data';

export class InteractionEvent extends PubSubEvent<InteractionEventData>
{
    public eventType = 'InteractionEvent';
}