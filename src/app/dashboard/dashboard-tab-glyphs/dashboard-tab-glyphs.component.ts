import { Component, OnInit, Injector } from '@angular/core';
import { DashboardTabComponent } from '../dashboard-tab/dashboard-tab.component';
import { GlyphType } from '../../glyph/glyph.type';
import { StarGlyph } from '../../glyph/glyph.star';
import { StarGlyphConfiguration } from '../../glyph/glyph.star.configuration';
import { FlowerGlyphConfiguration } from '../../glyph/glyph.flower.configuration';
import { FlowerGlyph } from '../../glyph/glyph.flower';

@Component({
  selector: 'app-dashboard-tab-glyphs',
  templateUrl: './dashboard-tab-glyphs.component.html',
  styleUrls: ['./dashboard-tab-glyphs.component.scss']
})
export class DashboardTabGlyphsComponent extends DashboardTabComponent
  implements OnInit {
  public typeStar = false;
  public typeFlower = true;

  constructor(injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    this.dataProvider.getDataSet().subscribe(message => {
      if (message == null) {
        return;
      }
    });
  }

  /**
   * Swtich the used color scale (either continuous or discrete values)
   * @param {any} e onChange event for HTML-radiobuttons
   */
  public onColorScaleChange(e: any): void {
    this.configuration.configurations[0].useColorRange = e.srcElement.value === 'ordinal';
    this.configuration.configurations[1].useColorRange = e.srcElement.value === 'ordinal';
    this.onLayoutChange();
  }

  /**
   * Switch the active glyphtype (flower or star).
   * @param {any} targetGlyph The HTML-image that was clicked on.
   */
  public onGlyphTypeSelect(event: any): void {
    const that = this;
    switch (event.srcElement.value) {
      case 'typeFlower':
        this.typeFlower = true;
        this.typeStar = false;
        this.configuration.activeGlyphType = GlyphType.Flower;
        this.configuration.configurations.forEach(config => {
          config.getData().subscribe(message => {
            if (message == null) {
              return;
            }
            const colorFeature = message.schema.color;
            const colorScale = (item: any) => config.color(+item[colorFeature]);

            config.glyph = new FlowerGlyph(
              config.glyph!.context,
              colorScale,
              that.configuration.flowerConfigs[config.currentLevelOfDetail] as FlowerGlyphConfiguration
            );
          });
        });
        break;
      case 'typeStar':
        this.typeFlower = false;
        this.typeStar = true;
        this.configuration.activeGlyphType = GlyphType.Star;
        this.configuration.configurations.forEach(config => {
          config.getData().subscribe(message => {
            if (message == null) {
              return;
            }
            const colorFeature = message.schema.color;
            const colorScale = (item: any) => config.color(+item[colorFeature]);

            config.glyph = new StarGlyph(
              config.glyph!.context,
              colorScale,
              that.configuration.starConfigs[config.currentLevelOfDetail] as StarGlyphConfiguration
            );
          });
        });
        break;
      default:
        break;
    }
    this.onConfigChange();
    this.onLayoutChange();
  }

  public onGlyphConfigChange(e: any): void {
    const conf: any = this.configuration.activeGlyphConfig();
    conf[e.property] = e.active;
    this.onConfigChange();
    this.onLayoutChange();
  }

  public onLODSliderChange(event: any): void {
    for (const key in this.configuration.configurations) {
      if (this.configuration.configurations.hasOwnProperty(key)) {
        const config = this.configuration.configurations[key];
        const levels = config.levelOfDetails;
        levels[event.slider + 1] = event.value;
        config.levelOfDetails = levels;
        if (config.currentLevelOfDetail === 1) { config.currentLevelOfDetail = 0; }
      }
    }
    this.onLayoutChange();
  }
}
