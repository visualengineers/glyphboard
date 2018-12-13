import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private currentScore = 500;
  private score = new BehaviorSubject(this.currentScore);
  score$ = this.score.asObservable();
  constructor() {}

  increaseScore(weight: number) {
    this.currentScore = this.currentScore + Math.floor(weight * 100);
    this.score.next(this.currentScore);
  }
}
