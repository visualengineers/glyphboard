import * as THREE from "three";

export class CameraSyncUtilities {

    private _data_Min: THREE.Vector2;
    private _data_Max: THREE.Vector2;

    private _data_Scale = new THREE.Vector2(1, 1);

    constructor(min: THREE.Vector2, max: THREE.Vector2, scale: THREE.Vector2)
    {
        this._data_Min = min;
        this._data_Max = max;

        this._data_Scale = scale;
    }

    public ComputeZoomOffset(scale: number, normMousePos: THREE.Vector2): ZoomOffsetParameter {
      const vpSize = new THREE.Vector2(
        (this._data_Max.x - this._data_Min.x) * this._data_Scale.x,
        (this._data_Max.y - this._data_Min.y) * this._data_Scale.y
      );

      const vpScaleOffset = new THREE.Vector2(
        (vpSize.x - (vpSize.x / scale)) * 0.5,
        (vpSize.y - (vpSize.y / scale)) * 0.5
      );

      const mouseOffsetFromCenter = normMousePos.sub(new THREE.Vector2(0.5, 0.5));

      const cursorOffset =  new THREE.Vector2(
        vpScaleOffset.x * mouseOffsetFromCenter.x * 2,
        vpScaleOffset.y * mouseOffsetFromCenter.y * 2
      );

      // return offset resulting in zoom (changing viewport size) and from zoom center (simple translation)
      const result = new ZoomOffsetParameter(vpScaleOffset, cursorOffset);
      return result;
    }

    public get DataMin(): THREE.Vector2 {return this._data_Min; }
    public get DataMax(): THREE.Vector2 {return this._data_Max; }
    public get DataScale(): THREE.Vector2 {return this._data_Scale; }
}

export class ZoomOffsetParameter {
    private _viewportScaleOffset: THREE.Vector2;
    private _cursorOffset: THREE.Vector2;

    constructor(vpOffset: THREE.Vector2, cursorOffset: THREE.Vector2) {
      this._viewportScaleOffset = vpOffset;
      this._cursorOffset = cursorOffset;
    }

    public get ViewportScaleOffset(): THREE.Vector2 { return this._viewportScaleOffset};
    public get CursorOffset(): THREE.Vector2 { return this._cursorOffset };
}
