import { RegionManager } from '../../home/region.manager';
import { Component, OnInit } from '@angular/core';
import { Region } from '../../home/region';

@Component({
  selector: 'app-dataflow',
  templateUrl: './dataflow.component.html',
  styleUrls: ['./dataflow.component.css']
})
export class DataflowComponent implements OnInit {
  public manager;

  constructor(private regionManager: RegionManager) { }

  ngOnInit() {
    this.manager = this.regionManager;
  }

}
