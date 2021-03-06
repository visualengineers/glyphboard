import { RegionManager } from 'src/app/region/region.manager';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-featureplot',
  templateUrl: './featureplot.component.html',
  styleUrls: ['./featureplot.component.css'],
  providers: [RegionManager]
})
export class FeatureplotComponent implements OnInit {
  public manager: RegionManager | undefined;

  constructor(public regionManager: RegionManager) { }

  ngOnInit() {
    this.manager = this.regionManager;
  }
}
