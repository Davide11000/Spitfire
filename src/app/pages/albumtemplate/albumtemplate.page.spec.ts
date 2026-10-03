import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlbumtemplatePage } from './albumtemplate.page';

describe('AlbumtemplatePage', () => {
  let component: AlbumtemplatePage;
  let fixture: ComponentFixture<AlbumtemplatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumtemplatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
