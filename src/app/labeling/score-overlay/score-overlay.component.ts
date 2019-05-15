import { Component, OnInit } from '@angular/core';
import { LabelingService } from '../labeling.service';

@Component({
  selector: 'app-score-overlay',
  templateUrl: './score-overlay.component.html',
  styleUrls: ['./score-overlay.component.scss']
})
export class ScoreOverlayComponent implements OnInit {
  currentScore;

  constructor(private label: LabelingService) { }

  ngOnInit() {
    this.currentScore = this.label.currentScore$;
  }

}
