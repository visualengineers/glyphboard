import { Injectable } from '@angular/core';

@Injectable()
export class LenseCursor {
  private _isVisible = false;
  private _scale = 1.0;
  private _isFixed = false;
  private _updateGlyphs = false;
  private _forceAnimateGlyphs = false;
  private _splitActive = false;
  private _display = false;

  private _boundaries: any = {
    left: 0,
    right: 960,
    top: 0,
    bottom: Infinity
  };

  private _position: any = {
    left: 0,
    top: 0
  };

  constructor() {}

  public show(): void {
    this._isVisible = true;
  }

  public hide(): void {
    this._isVisible = false;
    this._display = false;
  }

  public toggle(visible: boolean, position?: any): void {
    this._isVisible = visible;
    if (!this._isVisible) {
      this.display = false;
      this.isFixed = false
    }
    if (position !== undefined) { this.position = position };
  }

  get position(): any {
    return this._position;
  }
  set position(position: any) {
    const outLeft = position.left < this._boundaries.left;
    const outRight = position.left > this._boundaries.right;
    const outTop = position.top < this._boundaries.top;
    const outBottom = position.top > this._boundaries.bottom;

    if (outLeft || outRight || outTop || outBottom) {
      this.display = false;
    } else {
      this.display = true;
    }

    if ((outLeft || outRight) && !(outTop || outBottom)) {
      this._position.top = position.top;
    } else if ((outTop || outBottom) && !(outLeft || outRight)) {
      this._position.left = position.left;
    } else if ((outLeft || outRight) && (outTop || outBottom)) {
      return;
    } else {
      this._position = position;
    }
  }

  get scale(): number {
    return this._scale;
  }
  set scale(scale: number) {
    this._scale = scale;
  }

  get isVisible(): boolean {
    return this._isVisible;
  }

  get isFixed(): boolean {
    return this._isFixed;
  }
  set isFixed(flag: boolean) {
    this._isFixed = flag;
  }

  get display(): boolean {
    return this._display;
  }
  set display(flag: boolean) {
    this._display = flag;
  }

  get updateGlyphs(): boolean {
    return this._updateGlyphs;
  }
  set updateGlyphs(updateGlyphs: boolean) {
    this._updateGlyphs = updateGlyphs;
  }

  get forceAnimateGlyphs(): boolean {
    return this._forceAnimateGlyphs;
  }
  set forceAnimateGlyphs(forceAnimateGlyphs: boolean) {
    this._forceAnimateGlyphs = forceAnimateGlyphs;
  }

  get splitActive(): boolean {
    return this._splitActive;
  }
  set splitActive(flag: boolean) {
    this._splitActive = flag;
  }

  get boundaries(): any {
    return this._boundaries;
  }
  set boundaries(b: any) {
    this._boundaries = b;
  }
}
