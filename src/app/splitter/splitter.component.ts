import {ElementRef, ViewChild,  HostBinding,   Component,    OnInit} from '@angular/core';

@Component({
  selector: 'app-splitter',
  templateUrl: './splitter.component.html',
  styleUrls: ['./splitter.component.css']
})
export class SplitterComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

  getHeight() {
    return window.innerHeight;
  }
}
