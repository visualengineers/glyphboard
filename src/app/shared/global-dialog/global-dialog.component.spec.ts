import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalDialogComponent } from './global-dialog.component';

describe('GlobalDialogComponent', () => {
  let component: GlobalDialogComponent;
  let fixture: ComponentFixture<GlobalDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
