import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureplotComponent } from './featureplot.component';
import { Logger } from 'app/shared/services/logger.service';

describe('FeatureplotComponent', () => {
  let component: FeatureplotComponent;
  let fixture: ComponentFixture<FeatureplotComponent>;

  let loggerStub: {};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureplotComponent ],
      providers: [
        { provide: Logger, useValue: loggerStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureplotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
