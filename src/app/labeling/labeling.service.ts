import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface LabelMessage {
  questionId: string;
  answer: number;
  text: string;
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
    value: number
  ): Observable<boolean> {
    const message: LabelMessage = {
      questionId: feature,
      answer: value,
      text: text
    };
    return this.http.post<boolean>('http://127.0.0.1:5000/label', message);
  }
}
