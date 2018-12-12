import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGlyphlegendComponent } from './dashboard-glyphlegend.component';

describe('DashboardGlyphlegendComponent', () => {
  let component: DashboardGlyphlegendComponent;
  let fixture: ComponentFixture<DashboardGlyphlegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardGlyphlegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardGlyphlegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
