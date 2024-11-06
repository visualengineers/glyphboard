import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReflexTouchVisualizationComponent } from './reflex-touch-visualization.component';

describe('ReflexTouchVisualizationComponent', () => {
  let component: ReflexTouchVisualizationComponent;
  let fixture: ComponentFixture<ReflexTouchVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReflexTouchVisualizationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReflexTouchVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
