/// Event data for broadcasting current translation of the viewport for WebGL canvas
export class ViewportTransformationEventData {
    // absolute scale of the canvas
    private _scale: number;

    // absolute translation of canvas
    private _translateX: number;
    private _translateY: number;
    private _translateZ: number;

    /// constructing new event, if no values are provided --> 
    constructor(absTranslateX = 0, absTranslateY = 0, absTranslateZ = 0, absScale = 1) {
        this._scale = absScale;
        this._translateX = absTranslateX;
        this._translateY = absTranslateY;
        this._translateZ = absTranslateZ;
    }

    public GetScale(): number { return this._scale };
    
    // public SetScale(newScale: number) { this._scale = newScale; }

    public GetTranslateX(): number {return this._translateX;}
    public GetTranslateY(): number {return this._translateY;}
    public GetTranslateZ(): number {return this._translateZ;}
}