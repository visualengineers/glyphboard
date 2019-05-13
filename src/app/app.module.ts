import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { routing, appRoutingProviders } from './app.routes';
import { GlyphplotComponent } from './glyphplot/glyphplot.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Configuration } from './shared/services/configuration.service';
import { DashboardGlyphConfigComponent } from './dashboard/dashboard-tab-glyphs/dashboard-glyph-config.component';
import { DashboardFeatureConfigComponent } from './dashboard/dashboard-tab-filter/dashboard-feature-config.component';
import { MagicLenseComponent } from './lense/lense.component';
import { LenseCursor } from './lense/cursor.service';
import { TooltipComponent } from './tooltip/tooltip.component';
import { Helper } from './glyph/glyph.helper';
import { Logger } from './shared/services/logger.service';
import { FeatureplotComponent } from './featureplot/featureplot.component';
import { SplitterComponent } from './splitter/splitter.component';
import { DoubleSliderComponent } from './double_slider/double_slider.component';
import { EventAggregatorService } from './shared/events/event-aggregator.service';
import { DashboardSelectionVersionComponent } from './dashboard/dashboard-tab-context/dashboard-selection-version.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatTooltipModule,
  MatCheckboxModule,
  MatRadioModule,
  MatFormFieldModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatButtonModule,
  MatIconModule,
  MatButtonToggleModule,
  MatCardModule
} from '@angular/material';
import { DashboardGlyphlegendComponent } from './dashboard/dashboard-glyphlegend/dashboard-glyphlegend.component';
import { DashboardTabComponent } from './dashboard/dashboard-tab/dashboard-tab.component';
import { DashboardTabDataComponent } from './dashboard/dashboard-tab-data/dashboard-tab-data.component';
import { DashboardTabGlyphsComponent } from './dashboard/dashboard-tab-glyphs/dashboard-tab-glyphs.component';
import { DashboardTabFilterComponent } from './dashboard/dashboard-tab-filter/dashboard-tab-filter.component';
import { DashboardTabContextComponent } from './dashboard/dashboard-tab-context/dashboard-tab-context.component';
import { DashboardTogglesComponent } from './dashboard/dashboard-toggles/dashboard-toggles.component';
import { DashboardFunctionbuttonsComponent } from './dashboard/dashboard-functionbuttons/dashboard-functionbuttons.component';
import { GlobalDialogComponent } from './global-dialog/global-dialog.component';
import { AngularFileUploaderModule } from 'angular-file-uploader';
import { TooltipNewComponent } from './tooltip-new/tooltip-new.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GlyphplotComponent,
    FeatureplotComponent,
    DashboardComponent,
    DashboardGlyphConfigComponent,
    DashboardFeatureConfigComponent,
    DashboardSelectionVersionComponent,
    SplitterComponent,
    MagicLenseComponent,
    TooltipComponent,
    DoubleSliderComponent,
    DashboardGlyphlegendComponent,
    DashboardTabComponent,
    DashboardTabDataComponent,
    DashboardTabGlyphsComponent,
    DashboardTabFilterComponent,
    DashboardTabContextComponent,
    DashboardTogglesComponent,
    DashboardFunctionbuttonsComponent,
    GlobalDialogComponent,
    TooltipNewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    routing,
    AngularFontAwesomeModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatCardModule,
    AngularFileUploaderModule
  ],
  providers: [
    appRoutingProviders,
    Logger,
    Configuration,
    LenseCursor,
    Helper,
    EventAggregatorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
