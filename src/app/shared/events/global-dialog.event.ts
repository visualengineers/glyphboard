import { TemplateRef } from '@angular/core';
import { PubSubEvent } from './pub-sub-event';


export class GlobalDialogEvent extends PubSubEvent<GlobalDialogPayload> {
    // No implementation required
    public eventType = 'OpenGlobalDialogEvent';
}

export class GlobalDialogPayload {

    constructor(public dto: {title?: string, content: TemplateRef<any> | null, visible: boolean}) {
        this.dto = dto;
    }
}
