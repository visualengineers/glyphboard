import { Component, OnInit, Injector, TemplateRef } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { FitToSelectionTransmitterEvent } from 'app/shared/events/fit-to-selection-transmitter.event';
import { FitToScreenEvent } from 'app/shared/events/fit-to-screen.event';
import { FitToSelectionEvent } from 'app/shared/events/fit-to-selection.event';
import { DashboardSplitScreenEvent} from 'app/shared/events/dashboard-split-screen.event'
import { environment } from 'environments/environment';
import { ExportService } from '../dashboard.export';
import { GlyphLayout } from '../../glyph/glyph.layout';
import { GlobalDialogEvent, GlobalDialogPayload } from 'app/shared/events/global-dialog.event';

@Component({
  selector: 'app-dashboard-functionbuttons',
  templateUrl: './dashboard-functionbuttons.component.html',
  styleUrls: ['./dashboard-functionbuttons.component.scss']
})
export class DashboardFunctionbuttonsComponent extends DashboardTabComponent
  implements OnInit {
  public backendUploadRoute = environment.backendAddress;
  public afuConfig = {
    multiple: false,
    formatsAllowed: '.csv',
    maxSize: '5',
    uploadAPI:  {
      url: this.backendUploadRoute
    },
    theme: 'dragNDrop',
    hideProgressBar: true,
    hideResetBtn: true,
    hideSelectBtn: true
  };
  public resetUploadVar = false;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {}

  /**
   * Switch between splitscreen and single-view mode.
   */
  public onScreenToggle(): void {
    this.regionManager.regions[1].display =
      this.regionManager.regions[1].display === 'none' ? 'block' : 'none';
    this.regionManager.regions[0].display = 'block';
    this.regionManager.regions[3].display = 'none';
    this.configuration.splitScreenActive =
      this.regionManager.regions[1].display === 'block';

    const width = window.innerWidth;
    const height = window.innerHeight;
    this.regionManager.updateRegions(width, height);


    // move lens position
    if (this.configuration.splitScreenActive) {
      this.cursor.position.left -= width / 2;
    } else {
      this.cursor.position.left += width / 2;
    }

    this.cursor.splitActive = this.regionManager.regions[1].display === 'block';
    this.cursor.boundaries.right = width / (this.cursor.splitActive ? 2 : 1);

    this.eventAggregator.getEvent(DashboardSplitScreenEvent).publish(this.configuration.splitScreenActive);
  }

  /**
   * Change whether or not drawn glyphs are repositioned using the force layout.
   * @param  {any}    e the OnSelect evnt for HTML checkboxes
   */
  public onForceLayoutToggle(e: any) {
    this.configuration.configurations[0].useForceLayout = e.srcElement.checked;
    this.configuration.configurations[1].useForceLayout = e.srcElement.checked;
  }

  /**
   * Change the view layout in the glyphplots. Also enables the repositioning forces to change allow
   * animated changes between layoutes.
   * @param  {any}    e The onChange event for HTML-radiobuttons
   */
  public onViewLayoutToggle(e: any) {
    this.configuration.configurations.forEach(config => {
      config.useForceLayout = true;
      config.currentLayout =
        config.currentLayout === GlyphLayout.Matrix
          ? GlyphLayout.Cluster
          : GlyphLayout.Matrix;
    });
  }

  /**
   * Change whether or not drawn items should be aggregated
   * @param  {any}    e the OnSelect evnt for HTML checkboxes
   */
  public onAggregateItemsToggle(e: any) {
    this.configuration.configurations[0].aggregateItems = e.srcElement.checked;
    this.configuration.configurations[1].aggregateItems = e.srcElement.checked;
    this.onLayoutChange();
  }

  public fitToSelection() {
    this.eventAggregator.getEvent(FitToSelectionTransmitterEvent).publish(true);
  }

  public fitToScreen() {
    if (this.configuration.configurations[0].selectedDataSetInfo.name === '') {
      // TODO: Inform user that no data is loaded
      return;
    }
    this.configuration.configurations[0].currentLayout = GlyphLayout.Cluster;
    this.configuration.configurations[0].currentLevelOfDetail = 0;
    this.configuration.configurations[1].currentLayout = GlyphLayout.Cluster;
    this.configuration.configurations[1].currentLevelOfDetail = 0;
    this.eventAggregator.getEvent(FitToScreenEvent).publish(true);
  }

  public onExport(): void {
    const idListFirst = [];
    let dataFirst: any;
    this.configuration.configurations[0].getData().subscribe(message => {
      dataFirst = message;
    });
    if (dataFirst === null) {
      // TODO: Inform user that no data is loaded
      return;
    }
    const expFirst = new ExportService();
    expFirst.exportData(
      dataFirst,
      this.configuration.configurations[0].filteredItemsIds,
      [
        this.configuration.configurations[0].selectedDataSetInfo.name,
        this.configuration.configurations[0].selectedDataSetInfo
          .positionAlgorithm,
        this.configuration.configurations[0].selectedDataSetInfo.version
      ],
      this.configuration.configurations[0].activeFeatures,
      (this.configuration.configurations[0].featureFilters.length == 0)
    );
  }

  public openHelp() {
    window.open('https://visualengineers.github.io/glyphboard-doc/', '_blank');
  }

  public openUploadDialog(template: TemplateRef<any>) {
    this.eventAggregator.getEvent(GlobalDialogEvent).publish(new GlobalDialogPayload({
      content: template,
      title: 'File Upload',
      visible: true,
    }));
  }

  public docUpload(event: any) {
    this.logger.log(event);
    this.resetUploadVar = true;
  }
}
