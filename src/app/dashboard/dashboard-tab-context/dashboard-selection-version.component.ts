import {
  Component,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
  OnInit
} from '@angular/core';
import { Configuration } from 'src/app/shared/services/configuration.service';
import { Glyph } from '../../glyph/glyph';
import { FlowerGlyph } from '../../glyph/glyph.flower';
import { GlyphType } from '../../glyph/glyph.type';
import { StarGlyph } from '../../glyph/glyph.star';
import { Observable } from 'rxjs';
import { StarGlyphConfiguration } from 'src/app/glyph/glyph.star.configuration';
import { FlowerGlyphConfiguration } from 'src/app/glyph/glyph.flower.configuration';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'selection-version-item',
  templateUrl: './dashboard-selection-version.component.html',
  styleUrls: ['./dashboard-selection-version.component.scss']
})
export class DashboardSelectionVersionComponent implements OnInit, OnChanges {
  @ViewChild('chart', {static: false}) public chartContainer: ElementRef | undefined;
  private eventsSubscription: any

  @Input() label: string = "";
  @Input() property: string = "";
  @Input() object: any;
  @Input() configuration: Configuration | undefined;
  @Input() events: Observable<void> | undefined;

  private context: any;
  private glyph: Glyph | undefined;

  ngOnInit(): void {
    this.eventsSubscription = this.events?.subscribe(() => this.draw());
    this.draw();
  }

  private draw() {
    const element = this.chartContainer?.nativeElement;
    if(element === undefined) return;
    
    this.context = element.getContext('2d');

    const colorFeature = 1;
    const colorScale = (item: any) => {
      return item === undefined
        ? 0
        : this.configuration?.configurations[0].color(+item[colorFeature]);
    };

    switch (this.configuration?.activeGlyphType) {
      case GlyphType.Star:
        const starConfig: StarGlyphConfiguration = this.configuration?.starConfigs[2].clone() as StarGlyphConfiguration;
        if(starConfig !== undefined) {
          starConfig.radius = 45;
          this.glyph = new StarGlyph(this.context, colorScale, starConfig);
        }
        break;
      default:
        const flowerConfig = this.configuration?.flowerConfigs[2].clone() as FlowerGlyphConfiguration;
        if(flowerConfig !== undefined) {
          flowerConfig.radius = 45;
          this.glyph = new FlowerGlyph(this.context, colorScale, flowerConfig);
        }
        break;
    }

    this.context.save();
    this.context.clearRect(0, 0, 400, 200);

    const dummyPosition: any = {
      x: 52,
      y: 52
    };

    this.context.beginPath();
    this.glyph!.draw(dummyPosition, this.object, 1.0, false);
    this.context.restore();
  }

  ngOnChanges(): void { }
}
