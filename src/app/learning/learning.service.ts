import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Progress, Answer, Document } from './data.interfaces';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LearningService {
  private currentDocument = new BehaviorSubject<Document>(null);
  currentDocument$ = this.currentDocument.asObservable();
  mockProgress: Progress = {
    total: 10,
    done: 2
  };
  constructor(private http: HttpClient) {}

  init() {
    this.getNextDocument().subscribe(doc => {
      this.currentDocument.next(doc);
    });
  }

  getNextDocument(): Observable<Document> {
    // Mock
    return this.http
      .get<string>('https://icanhazdadjoke.com/', {
        headers: new HttpHeaders({
          Accept: 'application/json'
        })
      })
      .pipe(
        map((res: any) => {
          const nextDoc = {
            id: Math.floor(Math.random() * 100).toString(),
            text: res.joke
          };
          this.currentDocument.next(nextDoc);
          return nextDoc;
        })
      );
  }

  getProgress(): Observable<Progress> {
    // Mock
    return of(this.mockProgress);
  }

  getQuestionIds(): Observable<string[]> {
    // Mock
    return of(['isMusic', 'isMovie', 'isEvent']);
  }

  getAnswers(): Observable<string[]> {
    return of(['yes', 'maybe', 'no']);
  }

  saveAnswers(answers: Answer[]): Observable<boolean> {
    // Mock
    if (answers.length) {
      console.log('Sending to backend:', answers);
      return of(true);
    } else {
      return of(false);
    }
  }
}
