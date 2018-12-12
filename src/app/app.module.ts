import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AngularFontAwesomeModule } from 'angular-font-awesome';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { routing, appRoutingProviders } from './app.routes';
import { GlyphplotComponent } from './shared/glyphplot/glyphplot.component';
import { DashboardComponent } from './shared/dashboard/dashboard.component';
import { Configuration } from './shared/glyphplot/configuration.service';
import { DashboardGlyphConfigComponent } from './shared/dashboard/dashboard-tab-glyphs/dashboard-glyph-config.component';
import { DashboardFeatureConfigComponent } from './shared/dashboard/dashboard-tab-filter/dashboard-feature-config.component';
import { MagicLenseComponent } from './shared/lense/lense.component';
import { LenseCursor } from './shared/lense/cursor.service';
import { TooltipComponent } from './shared/tooltip/tooltip.component';
import { Helper } from './shared/glyph/glyph.helper';
import { Logger } from './logger.service';
import { FeatureplotComponent } from './shared/featureplot/featureplot.component';
import { SplitterComponent } from './shared/splitter/splitter.component';
import { DoubleSliderComponent } from './shared/double_slider/double_slider.component';
import { DataflowComponent } from './shared/dataflow/dataflow.component';
import { EventAggregatorService } from './shared/events/event-aggregator.service';
import { DashboardSelectionVersionComponent } from './shared/dashboard/dashboard-tab-context/dashboard-selection-version.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatTooltipModule,
  MatCheckboxModule,
  MatRadioModule,
  MatFormFieldModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';
import { DashboardGlyphlegendComponent } from './shared/dashboard/dashboard-glyphlegend/dashboard-glyphlegend.component';
import { DashboardTabComponent } from './shared/dashboard/dashboard-tab/dashboard-tab.component';
import { DashboardTabDataComponent } from './shared/dashboard/dashboard-tab-data/dashboard-tab-data.component';
import { DashboardTabGlyphsComponent } from './shared/dashboard/dashboard-tab-glyphs/dashboard-tab-glyphs.component';
import { DashboardTabFilterComponent } from './shared/dashboard/dashboard-tab-filter/dashboard-tab-filter.component';
import { DashboardTabContextComponent } from './shared/dashboard/dashboard-tab-context/dashboard-tab-context.component';
import { DashboardTogglesComponent } from './shared/dashboard/dashboard-toggles/dashboard-toggles.component';
import { DashboardFunctionbuttonsComponent } from './shared/dashboard/dashboard-functionbuttons/dashboard-functionbuttons.component';
import { GlobalDialogComponent } from './shared/global-dialog/global-dialog.component';
import { AngularFileUploaderModule } from 'angular-file-uploader';
import { GlyphplotWebglComponent } from './shared/glyphplot-webgl/glyphplot-webgl.component';

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
    DataflowComponent,
    DashboardGlyphlegendComponent,
    DashboardTabComponent,
    DashboardTabDataComponent,
    DashboardTabGlyphsComponent,
    DashboardTabFilterComponent,
    DashboardTabContextComponent,
    DashboardTogglesComponent,
    DashboardFunctionbuttonsComponent,
    GlobalDialogComponent,
    GlyphplotWebglComponent
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

export class AppModule { }
