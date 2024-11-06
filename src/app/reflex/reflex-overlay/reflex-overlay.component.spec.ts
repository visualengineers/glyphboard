import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReflexOverlayComponent } from './reflex-overlay.component';

describe('ReflexOverlayComponent', () => {
  let component: ReflexOverlayComponent;
  let fixture: ComponentFixture<ReflexOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReflexOverlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReflexOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
