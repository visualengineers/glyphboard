import { Component, OnInit } from '@angular/core';
import { trigger, transition, useAnimation } from '@angular/animations';
import { pulseAnimation } from '../shared/animations';
import { GamificationService } from '../shared/gamification.service';

@Component({
  selector: 'gl-score-display',
  templateUrl: './score-display.component.html',
  styleUrls: ['./score-display.component.scss'],
  animations: [
    trigger('scoreChange', [
      transition(
        ':increment',
        useAnimation(pulseAnimation, {
          params: {
            timings: '400ms cubic-bezier(.11,.99,.83,.43)',
            scale: 1.25
          }
        })
      )
    ])
  ]
})
export class ScoreDisplayComponent implements OnInit {
  constructor(public gamification: GamificationService) {}

  ngOnInit() {}
}
