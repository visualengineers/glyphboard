import { Injectable } from '@angular/core';
import { JsonFeature } from './data.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  NUMBER_OF_UNLABELED_DATA,
  UNLABELED_INDEX,
  ENTROPY_INDEX,
  URL_TO_DATA
} from '../config';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  data: JsonFeature[] = [];
  constructor(private http: HttpClient) {}
  loadData(src: string = URL_TO_DATA): Observable<JsonFeature[]> {
    return this.http
      .get<JsonFeature[]>(URL_TO_DATA)
      .pipe(map(res => this.enhanceFeatures(res)));
  }

  /** Mocking data to add unlabeled data and selectionScore (entropy) */
  enhanceFeatures(data: JsonFeature[]): JsonFeature[] {
    const features = data;
    for (let i = 0; i < features.length / 2; i++) {
      features[i]['features'][1][UNLABELED_INDEX] = 0;
      features[i]['features'][1][ENTROPY_INDEX] = Math.random();
    }
    return features;
  }
}
