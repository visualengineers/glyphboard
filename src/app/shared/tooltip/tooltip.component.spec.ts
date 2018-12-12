import { ComponentFixture, async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TooltipComponent } from './tooltip.component';

import { Helper } from '../glyph/glyph.helper';
import { Configuration } from '../glyphplot/configuration.service';

describe('TooltipService', () => {
  let controller: TooltipComponent;

  const dataSet: { features: Array<any>, position: Array<any>, schema: any } = {
    features: [
      { 'id': 0, 'features': { '0': '0' }, 'values': { '0': 0 }},
      { 'id': 1, 'features': { '0': '0' }, 'values': { '0': 10 }},
    ],
    position:  [
      { 'id': 0, 'position': { 'y': 0, 'x': 0 }},
      { 'id': 0, 'position': { 'y': 10, 'x': 10 }}
    ],
    schema: {
      tooltip: [ 'tooltip' ],
      label: { '0': 'label' }
    }
  };

  const helperStub = {};
  let configStub: { configurations: Array<any>, addConfiguration: Function };

  beforeEach(async(() => {
    configStub = {
      configurations: [],
      addConfiguration: () => { return { getData: () => { return { subscribe: () => dataSet } } } }
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Helper, useValue: helperStub },
        { provide: Configuration, useValue: configStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    controller = TestBed.get(TooltipComponent);
  });

  it('should create TooltipService', () => {
    expect(controller).toBeDefined();
  });

  // it('should not set a closest point after initialization', () => {
  //   expect(service.closestPoint).toBeUndefined();
  // });
  //
  // it('should update the closest featurepoint correctly', () => {
  //   const testEvent = { clientX: 0, clientY: 0 };
  //
  //   service.updateclosestPoint(null, testEvent);
  //
  //   expect(service.closestPoint).toEqual(dataSet.features[0].features);
  // });


});
