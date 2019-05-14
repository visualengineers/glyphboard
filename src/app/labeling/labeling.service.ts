import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LabelingService {
  constructor() {}

  labelData(id: number, feature: string, value: string): Observable<boolean> {
    return of(true);
  }
}
