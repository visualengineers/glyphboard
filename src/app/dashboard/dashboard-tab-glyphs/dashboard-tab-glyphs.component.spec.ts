import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabGlyphsComponent } from './dashboard-tab-glyphs.component';

describe('DashboardTabGlyphsComponent', () => {
  let component: DashboardTabGlyphsComponent;
  let fixture: ComponentFixture<DashboardTabGlyphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTabGlyphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabGlyphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
