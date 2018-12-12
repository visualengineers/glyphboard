import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTogglesComponent } from './dashboard-toggles.component';

describe('DashboardTogglesComponent', () => {
  let component: DashboardTogglesComponent;
  let fixture: ComponentFixture<DashboardTogglesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTogglesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTogglesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
