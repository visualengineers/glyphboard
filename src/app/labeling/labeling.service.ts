import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface LabelMessage {
  questionId: string;
  answer: number;
  text: string;
}

interface LabelAnswer {
  f1: number;
  precision: number;
  recall: number;
  history: number[];
}

@Injectable({
  providedIn: 'root'
})
export class LabelingService {
  private currentScore = new BehaviorSubject<number>(0);
  currentScore$ = this.currentScore.asObservable();

  constructor(private http: HttpClient) {
    this.http.get('http://127.0.0.1:5000/score').subscribe((score: number) => {
      this.currentScore.next(score);
    })
  }

  labelData(
    id: number,
    text: string,
    feature: string,
    value: number
  ): void {
    const message: LabelMessage = {
      questionId: feature,
      answer: value,
      text: text
    };
    this.http.post<LabelAnswer>('http://127.0.0.1:5000/label', message).subscribe(
      (res: any) => {
        console.log(res);
        this.currentScore.next(res.f1);
      }
    );
  }


}
