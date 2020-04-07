import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullPageLoadingSpinnerComponent } from './full-page-loading-spinner.component';

describe('FullPageLoadingSpinnerComponent', () => {
  let component: FullPageLoadingSpinnerComponent;
  let fixture: ComponentFixture<FullPageLoadingSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullPageLoadingSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullPageLoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
