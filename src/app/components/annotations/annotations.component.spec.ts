import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnotationsComponent } from './annotations.component';

describe('AnnotationsComponent', () => {
  let component: AnnotationsComponent;
  let fixture: ComponentFixture<AnnotationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AnnotationsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AnnotationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
