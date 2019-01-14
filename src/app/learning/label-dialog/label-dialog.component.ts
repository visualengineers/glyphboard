import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { LearningService } from '../learning.service';
import { QuestionService } from 'gamifilearning-lib';
import { flatMap } from 'rxjs/operators';

/*
Toughts / TODO:
Not sure if this component is needed. It adds an extra layer,
but gives flexibility in form of possible dialog data usage.
Might need refactoring to use directive.
*/

@Component({
  selector: 'app-label-dialog',
  templateUrl: './label-dialog.component.html',
  styleUrls: ['./label-dialog.component.scss']
})
export class LabelDialogComponent implements OnInit {
  currentInstance;
  questions;
  progress;
  rewards = [
    { icon: 'whatshot', position: 25, unlocked: false },
    { icon: 'whatshot', position: 50, unlocked: false },
    { icon: 'whatshot', position: 75, unlocked: false }
  ];
  answers;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any[],
    private learning: LearningService,
    private question: QuestionService
  ) {}

  ngOnInit() {
    this.currentInstance = this.learning.currentDocument$;
    this.questions = this.learning.getQuestionIds();
    this.progress = this.learning.getProgress();
    this.answers = this.learning.getAnswers();
    console.log(this.data);

    this.question.answers$
      .pipe(
        flatMap(answers => this.learning.saveAnswers(answers)),
        flatMap(_ => this.learning.getNextDocument())
      )
      .subscribe();
    // this.texts = this.question.getTopInstances(this.data);
    // this.questions = this.question.questions;
  }
}
