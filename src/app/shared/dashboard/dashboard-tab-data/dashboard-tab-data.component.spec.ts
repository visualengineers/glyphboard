import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabDataComponent } from './dashboard-tab-data.component';

describe('DashboardTabDataComponent', () => {
  let component: DashboardTabDataComponent;
  let fixture: ComponentFixture<DashboardTabDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTabDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
