import { Component, Input } from '@angular/core';
import { TouchInteractionMode } from 'src/app/shared/data/reflex.references';

@Component({
  selector: 'app-reflex-pan-visualization',
  templateUrl: './reflex-pan-visualization.component.html',
  styleUrls: ['./reflex-pan-visualization.component.scss']
})
export class ReflexPanVisualizationComponent {
  @Input()
  public mode: TouchInteractionMode = TouchInteractionMode.Info;

  @Input()
  public rotation: number = 0;

  @Input()
  public strength: number = 0;
}
