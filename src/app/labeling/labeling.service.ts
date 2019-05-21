import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DataproviderService } from 'app/shared/services/dataprovider.service';

interface LabelMessage {
  documentId: string | number;
  questionId: string;
  answer: number;
  text: string;
}

interface LabelAnswer {
  positions: Position[],
  train_result: {
    f1: number;
    precision: number;
    recall: number;
    history: number[];
  }
}

export interface Position {
  id: number,
  position: {
    x: number,
    y: number
  }
}

@Injectable({
  providedIn: 'root'
})
export class LabelingService {
  private currentScore = new BehaviorSubject<number | string>(0);
  currentScore$ = this.currentScore.asObservable();

  constructor(private http: HttpClient, private data: DataproviderService) {
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
    const message: LabelMessage = {
      documentId: id,
      questionId: feature,
      answer: value,
      text: text
    };
    return this.http.post<string>('http://127.0.0.1:5000/label', message)
    .pipe(
      map((res: string) => JSON.parse(res)),
      tap((res: LabelAnswer) => {
        this.currentScore.next(this.formatScore(res.train_result.f1));
        this.data.updatePositions(res.positions);
        console.log(this.data)
        // this.data.getDataSet().subscribe(res => console.log(res))
      })
    )
  }

  formatScore(score: number): string {
    return (score * 100).toFixed(2);
  }

  updatePositions(): void {

  }
}
