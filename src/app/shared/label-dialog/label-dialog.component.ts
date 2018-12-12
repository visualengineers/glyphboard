import { Component, OnInit, Inject } from '@angular/core';
import { QuestionService, JsonFeature } from 'gamifilearning-lib';
import { MAT_DIALOG_DATA } from '@angular/material';

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
  texts = [];
  questions = [];
  constructor(
    private question: QuestionService,
    @Inject(MAT_DIALOG_DATA) public data: JsonFeature[]
  ) {}

  ngOnInit() {
    console.log(this.data);
    this.texts = this.question.getTopInstances(this.data);
    this.questions = this.question.questions;
  }
}
