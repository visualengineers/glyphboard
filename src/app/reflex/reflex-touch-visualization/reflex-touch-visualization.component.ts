import { Component, Input } from '@angular/core';
import { TouchInteractionMode } from 'src/app/shared/data/reflex.references';

@Component({
  selector: 'app-reflex-touch-visualization',
  templateUrl: './reflex-touch-visualization.component.html',
  styleUrls: ['./reflex-touch-visualization.component.scss']
})
export class ReflexTouchVisualizationComponent {
  @Input()
  public mode: TouchInteractionMode = TouchInteractionMode.Info;
}
