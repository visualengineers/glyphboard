import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HomeComponent } from './home/home.component';
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
import { GlyphplotWebglComponent } from './glyphplot-webgl/glyphplot-webgl.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule} from '@angular/material/icon';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    GlyphplotWebglComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFileUploaderModule,
    FontAwesomeModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    BrowserAnimationsModule
  ],
  providers: [
    Logger,
    Configuration,
    LenseCursor,
    Helper,
    EventAggregatorService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
