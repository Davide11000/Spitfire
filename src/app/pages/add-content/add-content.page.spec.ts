import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddContentPage } from './add-content.page';

describe('AddContentPage', () => {
  let component: AddContentPage;
  let fixture: ComponentFixture<AddContentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddContentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
