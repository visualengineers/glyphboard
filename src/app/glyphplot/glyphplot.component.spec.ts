import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { GlyphplotComponent } from './glyphplot.component';
import { Logger } from 'app/shared/services/logger.service';
import { Glyph } from 'app/glyph/glyph';
import { FlowerGlyph } from 'app/glyph/glyph.flower';
import { FlowerGlyphConfiguration } from 'app/glyph/glyph.flower.configuration';
import { StarGlyph } from 'app/glyph/glyph.star';
import { StarGlyphConfiguration } from 'app/glyph/glyph.star.configuration';
import { Helper } from 'app/glyph/glyph.helper';
import { Configuration } from './configuration.service';
import { LenseCursor } from 'app/lense/cursor.service';

describe('GlyphplotComponent', () => {
  let de: DebugElement;
  let comp: GlyphplotComponent;
  let fixture: ComponentFixture<GlyphplotComponent>;

  // define dummies for components that are referenced by glyphplotcomponent. Only add relevant
  // properties, e.g. those that are used by glyphplot.
  let loggerStub: {};
  let tooltipStub: {};
  let helperStub: {};
  let configurationStub: { configurations: Array<any>, addConfiguration: Function };
  let flowerConfigStub: {};
  let starConfigStub: {};
  let glyphStub: {};
  let flowerGlyphStub: {};
  let starGlyphStub: {};
  let lensCursorStub: {};

  beforeEach(async(() => {
    // before each test reset connected components
    loggerStub = { logs: [] };
    tooltipStub = { data: {}, tooltip: {}, context: {}, closestPoint: {} };
    helperStub = {};
    configurationStub = {
      configurations: [],
      addConfiguration: () => { return { getData: () => { return { subscribe: () => null } } } }
    };
    flowerConfigStub = {};
    starConfigStub = {};
    glyphStub = {};
    flowerGlyphStub = {};
    starGlyphStub = {};
    lensCursorStub = {};

    TestBed.configureTestingModule({
      declarations: [ GlyphplotComponent ],
      providers: [
        { provide: Logger, useValue: loggerStub },
        { provide: Helper, useValue: helperStub },
        { provide: Configuration, useValue: configurationStub },
        { provide: FlowerGlyphConfiguration, useValue: flowerConfigStub },
        { provide: StarGlyphConfiguration, useValue: starConfigStub },
        { provide: Glyph, useValue: glyphStub },
        { provide: FlowerGlyph, useValue: flowerGlyphStub },
        { provide: StarGlyph, useValue: starGlyphStub },
        { provide: LenseCursor, useValue: lensCursorStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlyphplotComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement;
  });

  it('should create Glyphplot', () => {
    expect(comp).not.toBeUndefined();
  });

  it(`should fix a visible tooltip's position on click`, () => {
    // to test user input events, use triggerEventHandler and afterwards detectChanges to propagate
    // changes to the component
    de.triggerEventHandler('click', null);
    fixture.detectChanges();
  });
});
