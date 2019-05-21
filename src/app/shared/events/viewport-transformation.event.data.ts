import { UpdateItemsStrategy } from '../util/UpdateItemsStrategy';

/// Event data for broadcasting current translation of the viewport for WebGL canvas
export class ViewportTransformationEventData {
    // absolute scale of the canvas
    private _scale: number;

    // absolute translation of canvas
    private _translateX: number;
    private _translateY: number;
    private _translateZ: number;

    private _zoomViewportOffsetX: number;
    private _zoomViewportOffsetY: number;
    private _zoomViewportOffsetZ: number;

    private _zoomCursorOffsetX: number;
    private _zoomCursorOffsetY: number;
    private _zoomCursorOffsetZ: number;

    private _updateItems: UpdateItemsStrategy;

    /// constructing new event, if no values are provided --> 
    constructor(absTranslateX = 0, absTranslateY = 0, absTranslateZ = 0, absScale = 1, updateItems = UpdateItemsStrategy.DefaultUpdate, 
        zoomViewportOffsetX = 0, zoomViewportOffsetY = 0, zoomViewportOffsetZ = 0,
        zoomCursorOffsetX = 0, zoomCursorOffsetY = 0, zoomCursorOffsetZ = 0) {
        this._scale = absScale;
        this._translateX = absTranslateX;
        this._translateY = absTranslateY;
        this._translateZ = absTranslateZ;
        this._updateItems = updateItems;
        this._zoomViewportOffsetX = zoomViewportOffsetX;
        this._zoomViewportOffsetY = zoomViewportOffsetY;
        this._zoomViewportOffsetZ = zoomViewportOffsetZ;
        this._zoomCursorOffsetX = zoomCursorOffsetX;
        this._zoomCursorOffsetY = zoomCursorOffsetY;
        this._zoomCursorOffsetZ = zoomCursorOffsetZ;
    }

    public GetScale(): number { return this._scale };
    // public SetScale(newScale: number) { this._scale = newScale; }

    public GetTranslateX(): number {return this._translateX; }
    public GetTranslateY(): number {return this._translateY; }
    public GetTranslateZ(): number {return this._translateZ; }

    public GetZoomViewportOffsetX(): number {return this._zoomViewportOffsetX; }
    public GetZoomViewportOffsetY(): number {return this._zoomViewportOffsetY; }
    public GetZoomViewportOffsetZ(): number {return this._zoomViewportOffsetZ; }

    public GetZoomCursorOffsetX(): number {return this._zoomCursorOffsetX; }
    public GetZoomCursorOffsetY(): number {return this._zoomCursorOffsetY; }
    public GetZoomCursorOffsetZ(): number {return this._zoomCursorOffsetZ; }

    public GetUpdateStrategy(): UpdateItemsStrategy { return this._updateItems; }
}

