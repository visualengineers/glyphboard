import {
  Component,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
  OnInit
} from '@angular/core';
import { Configuration } from 'app/shared/services/configuration.service';
import { Glyph } from '../../glyph/glyph';
import { FlowerGlyph } from '../../glyph/glyph.flower';
import { GlyphType } from '../../glyph/glyph.type';
import { StarGlyph } from '../../glyph/glyph.star';
import { Observable } from 'rxjs';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'selection-version-item',
  templateUrl: './dashboard-selection-version.component.html',
  styleUrls: ['./dashboard-selection-version.component.scss']
})
export class DashboardSelectionVersionComponent implements OnInit, OnChanges {
  @ViewChild('chart')
  private chartContainer: ElementRef;
  private eventsSubscription: any

  @Input() label: string;
  @Input() property: string;
  @Input() object: any;
  @Input() configuration: Configuration;
  @Input() events: Observable<void>;

  private context: any;
  private glyph: Glyph;

  ngOnInit(): void {
    this.eventsSubscription = this.events.subscribe(() => this.draw());
    this.draw();
  }

  private draw() {
    const element = this.chartContainer.nativeElement;
    this.context = element.getContext('2d');

    const colorFeature = 1;
    const colorScale = item => {
      return item === undefined
        ? 0
        : this.configuration.configurations[0].color(+item[colorFeature]);
    };

    switch (this.configuration.activeGlyphType) {
      case GlyphType.Star:
        const flowerConfig = this.configuration.starConfigs[2].clone();
        flowerConfig.radius = 45;
        this.glyph = new StarGlyph(this.context, colorScale, flowerConfig);
        break;
      default:
        const starConfig = this.configuration.flowerConfigs[2].clone();
        starConfig.radius = 45;
        this.glyph = new FlowerGlyph(this.context, colorScale, starConfig);
        break;
    }

    this.context.save();
    this.context.clearRect(0, 0, 400, 200);

    const dummyPosition: any = {
      x: 52,
      y: 52
    };

    this.context.beginPath();
    this.glyph.draw(dummyPosition, this.object, 1.0, false);
    this.context.restore();
  }

  ngOnChanges(): void { }
}
