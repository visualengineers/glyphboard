import * as THREE from "three";
import { Vector2 } from "three";

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

    public ComputeZoomOffset(
      newScale: number,
      normMousePos: THREE.Vector2): ZoomOffsetParameter {

      // determine unscaled viewport
      const vpSize = new THREE.Vector2(
        (this._data_Max.x - this._data_Min.x),
        (this._data_Max.y - this._data_Min.y)
      );


      // scale viewport to scaling factor (scale to center (0.5, 0.5)
      const vpSizeScaled = new THREE.Vector2(
        vpSize.x * this._data_Scale.x,
        vpSize.y * this._data_Scale.y
      );

      console.log('norm mouse pos: [ ' + normMousePos.x + ' | ' + normMousePos.y + ' ]');

      // compute diagonal offset resulting from scale
      const vpScaleOffset = new THREE.Vector2(
        (vpSizeScaled.x - (vpSizeScaled.x / newScale)) * 0.5,
        (vpSizeScaled.y - (vpSizeScaled.y / newScale)) * 0.5
      );

      // compute normalized mouse coordinates realtive to center
      const mouseOffsetFromCenter = (normMousePos); // normMousePos.sub(new THREE.Vector2(0.5, 0.5));

      // compute cursor coordinates in world coordinates
      const cursorOffset =  new THREE.Vector2(
        mouseOffsetFromCenter.x * 2 * vpScaleOffset.x,
        mouseOffsetFromCenter.y * 2 * vpScaleOffset.y,
      );

      console.log('vpScaleOffset: [' + vpScaleOffset.x + ' | ' + vpScaleOffset.y + ' ] - MouseOffset: [' + cursorOffset.x + ' | ' + cursorOffset.y + ' ]');

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
