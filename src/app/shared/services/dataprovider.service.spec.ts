import { async, TestBed } from '@angular/core/testing';

import { DataproviderService } from './dataprovider.service';

import { Http } from '@angular/http';

describe('DataproviderService', () => {
  let service: DataproviderService;
  let httpStub: { get: Function };

  beforeEach(async(() => {
    httpStub = { get: (d) => { const x = { subscribe: () => {} }; return x } };

    TestBed.configureTestingModule({
      providers: [
        DataproviderService,
        { provide: Http, useValue: httpStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(DataproviderService);
  });

  it('should create the service', () => {
    expect(service).toBeDefined();
  });
});
