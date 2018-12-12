import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardTabContextComponent } from './dashboard-tab-context.component';

describe('DashboardTabContextComponent', () => {
  let component: DashboardTabContextComponent;
  let fixture: ComponentFixture<DashboardTabContextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardTabContextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardTabContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
