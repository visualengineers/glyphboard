import { UpdateItemsStrategy } from '../util/UpdateItemsStrategy';

/// Event data for broadcasting current translation of the viewport for WebGL canvas
export class ViewportTransformationEventData {
    // absolute scale of the canvas
    private _scale: number;

    // absolute translation of canvas
    private _translateX: number;
    private _translateY: number;
    private _translateZ: number;

    private _normTargetCoordX: number;
    private _normTargetCoordY: number;
    private _normTargetCoordZ: number;

    private _updateItems: UpdateItemsStrategy;

    /// constructing new event, if no values are provided --> 
    constructor(absTranslateX = 0, absTranslateY = 0, absTranslateZ = 0, absScale = 1, updateItems = UpdateItemsStrategy.DefaultUpdate, 
        normTargetCoordX = 0.5, normTargetCoordY = 0.5, normTargetCoordZ = 0.5) {
        this._scale = absScale;
        this._translateX = absTranslateX;
        this._translateY = absTranslateY;
        this._translateZ = absTranslateZ;
        this._updateItems = updateItems;
        this._normTargetCoordX = normTargetCoordX;
        this._normTargetCoordY = normTargetCoordY;
        this._normTargetCoordZ = normTargetCoordZ;
    }

    public GetScale(): number { return this._scale };
    // public SetScale(newScale: number) { this._scale = newScale; }

    public GetTranslateX(): number {return this._translateX; }
    public GetTranslateY(): number {return this._translateY; }
    public GetTranslateZ(): number {return this._translateZ; }

    public GetNormalizedTargetCoordinateX(): number {return this._normTargetCoordX; }
    public GetNormalizedTargetCoordinateY(): number {return this._normTargetCoordY; }
    public GetNormalizedTargetCoordinateZ(): number {return this._normTargetCoordZ; }

    public GetUpdateStrategy(): UpdateItemsStrategy { return this._updateItems; }
}

