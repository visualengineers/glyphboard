import { Component, OnInit } from '@angular/core';
import { GamificationService } from '../shared/gamification.service';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'gl-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  gamification = this.gamificationService;
  constructor(
    public user: UserService,
    private gamificationService: GamificationService
  ) {}

  ngOnInit() {}
}
