import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
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
  private currentScore = new BehaviorSubject<number | string>(0);
  currentScore$ = this.currentScore.asObservable();

  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor(private http: HttpClient) {
    this.http.get('http://127.0.0.1:5000/score').subscribe((score: number) => {
      this.currentScore.next(this.formatScore(score));
    })
  }

  labelData(
    id: number,
    text: string,
    feature: string,
    value: number
  ): Observable<LabelAnswer> {
    this.isLoading.next(true);
    const message: LabelMessage = {
      questionId: feature,
      answer: value,
      text: text
    };
    return this.http.post<LabelAnswer>('http://127.0.0.1:5000/label', message)
    .pipe(
      tap(res => {
        console.log(res);
        this.currentScore.next(this.formatScore(res.f1));
        this.isLoading.next(false);
      })
    )
  }

  formatScore(score: number): string {
    return (score * 100).toFixed(2);
  }
}
