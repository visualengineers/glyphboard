import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
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
    return this.http.post<LabelAnswer>('http://127.0.0.1:5000/label', message)
    .pipe(
      tap((res: LabelAnswer) => {
          this.currentScore.next(this.formatScore(res.train_result.f1));
          this.data.updateDataPoint(message.documentId, message.answer);
          // this.data.updatePositions(res.positions);
          // this.data.downloadDataSet('mainTfIdf', '05112018', 'umap')
          // console.log(this.data)
          // this.data.getDataSet().subscribe(res => console.log(res))
        }
      )
    )
  }

  triggerUpdate() {
    return this.http.get<Position[]>('http://127.0.0.1:5000/update').pipe(
      tap(res => {
        this.data.updatePositions(res);
      })
    )
  }

  formatScore(score: number): string {
    return (score * 100).toFixed(2);
  }
}
