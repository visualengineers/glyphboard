import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { QuestionService } from '../shared/question.service';
import { MatSelectionList } from '@angular/material/list';
import { GamificationService } from '../shared/gamification.service';
import { JsonFeature, Question, Answer } from '../shared/data.interface';
import { ENTROPY_INDEX } from '../config';

@Component({
  selector: 'gl-question-room',
  templateUrl: './question-room.component.html',
  styleUrls: ['./question-room.component.scss']
})
export class QuestionRoomComponent implements OnInit {
  question = this.questionService;
  clicked = false;
  activeIndex = 0;

  @Input() texts: JsonFeature[];
  @Input() questions: Question[];

  @ViewChild('selectionList')
  selection: MatSelectionList;
  constructor(
    private questionService: QuestionService,
    private gamification: GamificationService
  ) {}

  ngOnInit() {
    console.log(this.texts, this.questions);
  }

  isDone(): boolean {
    return !(this.activeIndex < this.texts.length);
  }

  submitAnswer(currentFeature: JsonFeature) {
    this.gamification.increaseScore(currentFeature.features[1][ENTROPY_INDEX]);
    // Simple array with all selected answers
    const selectedAnswers: string[] = [];
    this.selection.selectedOptions.selected.forEach(selected => {
      selectedAnswers.push(selected.value);
    });
    this.question.handleSubmittedAnswers(selectedAnswers, currentFeature);
    this.activeIndex++;
  }
}
