import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFunctionbuttonsComponent } from './dashboard-functionbuttons.component';

describe('DashboardFunctionbuttonsComponent', () => {
  let component: DashboardFunctionbuttonsComponent;
  let fixture: ComponentFixture<DashboardFunctionbuttonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardFunctionbuttonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardFunctionbuttonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
