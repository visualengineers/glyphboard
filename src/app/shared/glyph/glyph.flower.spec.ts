import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ScaleLinear } from 'd3-scale';
import * as d3 from 'd3';

import { FlowerGlyph } from './glyph.flower';
import { Glyph } from './glyph';

describe('FlowerGlyph', () => {
  // let conf:FlowerGlyphConfiguration = new FlowerGlyphConfiguration();
  // let colorScale:ScaleLinear<number, number> = d3.scaleLinear();
  const comp: FlowerGlyph = new FlowerGlyph(null, null, null);

  it(`should create an instance of FlowerGlyph`, () => {
    expect(comp).not.toBeNull();
  });

  it('should calculate rgb values correctly from hex', () => {
    expect(Glyph.hexToRgb('#000000')).toEqual([0x00, 0x00, 0x00]);
    expect(Glyph.hexToRgb('#fa8159')).toEqual([0xFA, 0x81, 0x59]);
  });

  it(`should return 'white' for invalid properties`, () => {
    expect(Glyph.hexToRgb(null)).toEqual([0xFF, 0xFF, 0xFF]);
    expect(Glyph.hexToRgb('##')).toEqual([0xFF, 0xFF, 0xFF]);
    expect(Glyph.hexToRgb('#123456789')).toEqual([0xFF, 0xFF, 0xFF]);
  });
});
