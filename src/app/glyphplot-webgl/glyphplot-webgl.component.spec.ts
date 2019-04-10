import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlyphplotWebglComponent } from './glyphplot-webgl.component';

describe('GlyphplotWebglComponent', () => {
  let component: GlyphplotWebglComponent;
  let fixture: ComponentFixture<GlyphplotWebglComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlyphplotWebglComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlyphplotWebglComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
