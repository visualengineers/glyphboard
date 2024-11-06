import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReflexPanVisualizationComponent } from './reflex-pan-visualization.component';

describe('ReflexPanVisualizationComponent', () => {
  let component: ReflexPanVisualizationComponent;
  let fixture: ComponentFixture<ReflexPanVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReflexPanVisualizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReflexPanVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
