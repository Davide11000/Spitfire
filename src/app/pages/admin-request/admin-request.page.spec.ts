import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminRequestPage } from './admin-request.page';

describe('AdminRequestPage', () => {
  let component: AdminRequestPage;
  let fixture: ComponentFixture<AdminRequestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
