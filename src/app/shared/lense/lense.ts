import { Injectable } from '@angular/core';

@Injectable()
export class MagicLense {
  private _isVisible = false;
  private _scale = 1.0;
  private _position: any = {
    left: 0,
    top: 0
  }

  constructor() {}

  public show(): void {
    this._isVisible = true;
  }

  public hide(): void {
    this._isVisible = false;
  }

  public toggle(): void {
    this._isVisible = !this._isVisible;
  }

  get position(): any { return this._position; }
  set position(position: any) {
    if (position.left < 0 || position.top < 0) { return; }

    this._position = position;
  }

  get scale(): number { return this._scale; }
  set scale(scale: number) { this._scale = scale; }

  get isVisible(): boolean { return this._isVisible; }
}
