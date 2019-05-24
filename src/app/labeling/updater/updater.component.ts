import { Component, OnInit } from '@angular/core';
import { LabelingService } from '../labeling.service';

@Component({
  selector: 'app-updater',
  templateUrl: './updater.component.html',
  styleUrls: ['./updater.component.scss']
})
export class UpdaterComponent implements OnInit {
  loading = false;
  constructor(private label: LabelingService) {}

  ngOnInit() {}

  triggerUpdate() {
    this.loading = true;
    this.label.triggerUpdate().subscribe(res => {
      console.log(res);
      this.loading = false;
    });
  }
}
