import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'gl-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {
  columnsToDisplay = ['rank', 'userName', 'score'];

  users = [
    { name: 'Phil', rank: '1', score: '555' },
    { name: 'Mill', rank: '2', score: '444' },
    { name: 'Bill', rank: '3', score: '333' },
    { name: 'Til', rank: '4', score: '222' }
  ];

  constructor() {}

  ngOnInit() {}
}
