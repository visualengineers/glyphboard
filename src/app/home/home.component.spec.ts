import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { HomeComponent } from './home.component';
import { Http } from '@angular/http';
import { GlyphplotComponent } from 'app/glyphplot/glyphplot.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let glyphPlotStub: { width: number };
  let httpStub: { get: Function };

  beforeEach(async(() => {
    glyphPlotStub = { width: 1000 };
    httpStub = { get: (d) => { const x = { subscribe: () => {} }; return x } };

    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ HomeComponent ],
      providers: [
        { provide: GlyphplotComponent, useValue: glyphPlotStub },
        { provide: Http, useValue: httpStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
