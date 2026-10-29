import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SongtemplatePage } from './songtemplate.page';

describe('SongtemplatePage', () => {
  let component: SongtemplatePage;
  let fixture: ComponentFixture<SongtemplatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SongtemplatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
