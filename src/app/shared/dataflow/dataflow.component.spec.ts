import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataflowComponent } from './dataflow.component';
import { RegionManager } from '../../home/region.manager';

describe('DataflowComponent', () => {
  let component: DataflowComponent;
  let fixture: ComponentFixture<DataflowComponent>;

  let regionManagerStub: {};

  beforeEach(async(() => {
    regionManagerStub = {};

    TestBed.configureTestingModule({
      declarations: [ DataflowComponent ],
      providers: [
        { provide: RegionManager, useValue: regionManagerStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
