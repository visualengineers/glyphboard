import {RegionManager} from '../../home/region.manager';
import { Component, OnInit } from '@angular/core';
import { Region } from '../../home/region';

@Component({
  selector: 'app-featureplot',
  templateUrl: './featureplot.component.html',
  styleUrls: ['./featureplot.component.css'],
  providers: [RegionManager]
})
export class FeatureplotComponent implements OnInit {
  public manager;

  constructor(public regionManager: RegionManager) { }

  ngOnInit() {
    this.manager = this.regionManager;
  }
}
