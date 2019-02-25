import { UpdateItemsStrategy } from '../util/UpdateItemsStrategy';

/// Event data for broadcasting current translation of the viewport for WebGL canvas
export class ViewportTransformationEventData {
    // absolute scale of the canvas
    private _scale: number;

    // absolute translation of canvas
    private _translateX: number;
    private _translateY: number;
    private _translateZ: number;

    private _updateItems: UpdateItemsStrategy;

    /// constructing new event, if no values are provided --> 
    constructor(absTranslateX = 0, absTranslateY = 0, absTranslateZ = 0, absScale = 1, updateItems = UpdateItemsStrategy.DefaultUpdate) {
        this._scale = absScale;
        this._translateX = absTranslateX;
        this._translateY = absTranslateY;
        this._translateZ = absTranslateZ;
        this._updateItems = updateItems;
    }

    public GetScale(): number { return this._scale };
    // public SetScale(newScale: number) { this._scale = newScale; }

    public GetTranslateX(): number {return this._translateX; }
    public GetTranslateY(): number {return this._translateY; }
    public GetTranslateZ(): number {return this._translateZ; }

    public GetUpdateStrategy(): UpdateItemsStrategy { return this._updateItems; }
}

