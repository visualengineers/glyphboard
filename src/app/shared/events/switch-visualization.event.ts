import { PubSubEvent } from './pub-sub-event';

export class SwitchVisualizationEvent extends PubSubEvent<VisualizationType> {
    public eventType = 'SwitchVisualizationEvent';
}

export enum VisualizationType {
    D3 = 0,
    ThreeJS = 1
}