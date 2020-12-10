export abstract class EventBase {
    public eventType: string = "";

    abstract publish(payload: any): void;
}
