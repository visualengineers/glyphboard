import { Injectable } from '@angular/core';

@Injectable()
export class Helper {
  checkClipping(object: any): boolean;
  checkClipping(x: number, y: number): boolean;
  checkClipping(firstParam: any, secondParam?: any): boolean {
    let x = 0;
    let y = 0;
    if (secondParam === undefined) {
      x = firstParam.x;
      y = firstParam.y;
    } else {
      x = firstParam;
      y = secondParam;
    }
    return x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight;
  }
}
