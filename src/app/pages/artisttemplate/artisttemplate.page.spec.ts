import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArtisttemplatePage } from './artisttemplate.page';

describe('ArtisttemplatePage', () => {
  let component: ArtisttemplatePage;
  let fixture: ComponentFixture<ArtisttemplatePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtisttemplatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
