import { Interaction } from "../util/interaction";

export class InteractionEventData {
    private _interactionEvent: Interaction | null;

    private _positionX: number;
    private _positionY: number;
    private _positionZ: number;

    constructor(interactionEvent: Interaction | null, positionX = 0, positionY = 0, positionZ = 0){
        this._interactionEvent = interactionEvent;

        this._positionX = positionX;
        this._positionY = positionY;
        this._positionZ = positionZ;
    }

    public GetInteractionEvent(): Interaction | null {return this._interactionEvent;}

    public GetPositionX(): number{return this._positionX;}
    public GetPositionY(): number{return this._positionY;}
    public GetPositionZ(): number{return this._positionZ;}
}