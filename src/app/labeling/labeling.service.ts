import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface LabelMessage {
  questionId: string;
  answer: number;
  text: string;
}

export interface JsonFeature {
  id: number;
  'default-context': string;
  features: { 1: { [key: string]: string } };
  values: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class LabelingService {
  constructor(private http: HttpClient) {}

  labelData(
    id: number,
    text: string,
    feature: string,
    value: string
  ): Observable<boolean> {
    const message: LabelMessage = {
      questionId: feature,
      answer: value === 'yes' ? 1 : 0,
      text: text
    };
    return this.http.post<boolean>('http://127.0.0.1:5000/label', message);
  }

  mockDataset(data: JsonFeature[]): JsonFeature[] {
    const features = data;
    // Mark half the data set as labeled
    for (let i = 0; i < features.length / 2; i++) {
      features[i]['labels'][0]['questionId'] = 'isMusic';
      features[i]['labels'][0]['answer'] = 1;
    }
    return features;
  }
}
