import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabFilterComponent } from './dashboard-tab-filter.component';

describe('DashboardTabFilterComponent', () => {
  let component: DashboardTabFilterComponent;
  let fixture: ComponentFixture<DashboardTabFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTabFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
