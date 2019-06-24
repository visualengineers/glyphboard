import { Component, OnInit, Injector } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { ConfigurationData } from '../../shared/services/configuration.data';
import { SelectionService } from 'app/shared/services/selection.service';

@Component({
  selector: 'app-dashboard-tab-data',
  templateUrl: './dashboard-tab-data.component.html',
  styleUrls: ['./dashboard-tab-data.component.scss']
})
export class DashboardTabDataComponent extends DashboardTabComponent implements OnInit {
  public datasets: any;
  private allDatasets: Array<any>;

  // properties for the primary dataset (the one displayed on the left)
  public selectedDataset: string;
  public selectedVersion: string;
  public selectedPositionAlgorithm: string;
  public selectedContext: string;
  public versions = new Array<string>();
  public positionAlgorithms = new Array<string>();
  public featureContexts = new Array<any>();

  // properties for the secondary dataset (displayed to the right of the primary one)
  public selectedDatasetSecond: string;
  public selectedVersionSecond: string;
  public selectedPositionAlgorithmSecond: string;
  public selectedContextSecond: string;
  public versionsSecond = new Array<string>();
  public positionAlgorithmsSecond = new Array<string>();
  public featureContextsSecond = new Array<any>();

  constructor(injector: Injector, private selectionService: SelectionService) {
    super(injector);
  }

  ngOnInit() {
    this.dataProvider.getDataSets().subscribe(message => {
      this.datasets = message;
      this.updateDatasets();
    });

    this.dataProvider.getDataSet().subscribe(message => {
      if (message == null) {
        return;
      }

      if (this.configuration.dataSetRequest === 0 &&
          this.selectedDataset !== this.selectedDatasetSecond) {
        // Load same dataset for right side!
        this.selectedDatasetSecond = this.selectedDataset;
        this.dashboardDataSetChangedSecond();
      }
    });
  }

  private updateDatasets() {
    if (this.datasets === undefined || this.datasets.length === 0) {
      return;
    }

    this.allDatasets = [];
    this.datasets.forEach(dataset => {
      dataset.Items.forEach(item => {
        if (item.Algorithms.position instanceof Array) {
          item.Algorithms.position.forEach(positionAlgorithm => {
            this.allDatasets.push({
              name: dataset.Dataset,
              version: item.Time,
              position: positionAlgorithm
            });
          });
        } else {
          this.allDatasets.push({
            name: dataset.Dataset,
            version: item.Time,
            position: item.Algorithms.position
          });
        }
      });
    });
  }

  public updateData(config: number) {
    // Get requested dataset from DataProvider
    this.configuration.dataSetRequest = config;
    this.dataProvider.downloadDataSet(
      config === 0 ? this.selectedDataset : this.selectedDatasetSecond,
      config === 0 ? this.selectedVersion : this.selectedVersionSecond,
      config === 0
        ? this.selectedPositionAlgorithm
        : this.selectedPositionAlgorithmSecond
    );
  }

  private updateDataSetInfo(second: boolean) {
    this.configuration.configurations[second ? 1 : 0].selectedDataSetInfo = {
      name: second ? this.selectedDatasetSecond : this.selectedDataset,
      version: second ? this.selectedVersionSecond : this.selectedVersion,
      positionAlgorithm: second ? this.selectedPositionAlgorithmSecond : this.selectedPositionAlgorithm
    };
  }

  // Rebuild the dataset list every time its changed.
  dashboardDataSetChanged() {
    this.selectionService.featureFilters.length = 0;
    if (this.allDatasets.length === 0) {
      return;
    }

    this.versions.splice(0, this.versions.length);
    this.positionAlgorithms.splice(0, this.positionAlgorithms.length);

    this.allDatasets.forEach(dataset => {
      if (
        dataset.name === this.selectedDataset &&
        !this.versions.includes(dataset.version)
      ) {
        this.versions.push(dataset.version);
      }
    });
    this.selectedVersion = this.versions[0];

    this.allDatasets.forEach(dataset => {
      if (
        dataset.name === this.selectedDataset &&
        dataset.version === this.selectedVersion
      ) {
        this.positionAlgorithms.push(dataset.position);
      }
    });
    this.selectedPositionAlgorithm = this.positionAlgorithms[0];

    // reset feature contexts
    this.configuration.configurations[0].globalFeatureContext = 1;
    this.configuration.configurations[1].globalFeatureContext = 1;

    this.updateDataSetInfo(false);
    this.updateData(0);
  }

  dashboardVersionChanged() {
    if (this.allDatasets.length === 0) {
      return;
    }

    this.positionAlgorithms.splice(0, this.positionAlgorithms.length);
    this.allDatasets.forEach(dataset => {
      if (
        dataset.name === this.selectedDataset &&
        dataset.version === this.selectedVersion
      ) {
        this.positionAlgorithms.push(dataset.position);
      }
    });
    this.selectedPositionAlgorithm = this.positionAlgorithms[0];

    this.updateDataSetInfo(false);
    this.updateData(0);
  }

  dashboardPositionChanged() {
    this.updateDataSetInfo(false);
    this.onLayoutChange();
    this.updateData(0);
  }

  dashboardDataSetChangedSecond() {
    this.selectionService.featureFilters.length = 0;
    if (this.allDatasets.length === 0) {
      return;
    }

    this.versionsSecond.splice(0, this.versionsSecond.length);
    this.positionAlgorithmsSecond.splice(
      0,
      this.positionAlgorithmsSecond.length
    );

    this.allDatasets.forEach(dataset => {
      if (
        dataset.name === this.selectedDatasetSecond &&
        !this.versionsSecond.includes(dataset.version)
      ) {
        this.versionsSecond.push(dataset.version);
      }
    });
    this.selectedVersionSecond = this.versionsSecond[0];

    this.allDatasets.forEach(dataset => {
      if (
        dataset.name === this.selectedDatasetSecond &&
        dataset.version === this.selectedVersionSecond
      ) {
        this.positionAlgorithmsSecond.push(dataset.position);
      }
    });
    this.selectedPositionAlgorithmSecond = this.positionAlgorithmsSecond[0];

    this.updateDataSetInfo(true);
    this.updateData(1);
  }

  dashboardVersionChangedSecond() {
    if (this.allDatasets.length === 0) {
      return;
    }

    this.positionAlgorithmsSecond.splice(
      0,
      this.positionAlgorithmsSecond.length
    );
    this.allDatasets.forEach(dataset => {
      if (
        dataset.name === this.selectedDatasetSecond &&
        dataset.version === this.selectedVersionSecond
      ) {
        this.positionAlgorithmsSecond.push(dataset.position);
      }
    });
    this.selectedPositionAlgorithmSecond = this.positionAlgorithmsSecond[0];

    this.updateDataSetInfo(true);
    this.updateData(1);
  }

  dashboardPositionChangedSecond() {
    this.updateDataSetInfo(true);
    this.onLayoutChange();
    this.updateData(1);
  }

  /**
   * Set the global feature context for a given configuration.
   * @param  {object}  e    onchange event
   * @param  {string}  view 'left' or 'right', depending on which view's context to chage
   * @return {void}
   */
  public onGlobalFeatureContextChange(e: any, view: string): void {
    let context: number;
    let config: ConfigurationData;

    // the list of feature contexts is sorted by their ids (index starting at 1), so add the
    // position of the selected option as the new global context.
    context = +e.value.id;

    if (view === 'left') {
      config = this.configuration.configurations[0];
    } else if (view === 'right') {
      config = this.configuration.configurations[1];
    }

    config.globalFeatureContext = context;
    this.onLayoutChange();
  }
}
