import { Component, OnInit } from '@angular/core';
import { CommunicationService } from './shared/communication.service';
import { QUESTIONS } from './shared/question.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'gl-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class RootComponent implements OnInit {
  texts = this.communication.loadData().pipe(map(data => data.slice(0, 5)));
  questions = QUESTIONS;
  constructor(public communication: CommunicationService) {}

  ngOnInit() {
    // this.communication.loadData().subscribe(res => {
    //   this.texts = res;
    // });
    // this.questions = QUESTIONS;
  }
}
