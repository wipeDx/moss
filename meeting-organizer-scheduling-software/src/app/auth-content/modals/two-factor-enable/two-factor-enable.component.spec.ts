import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFactorEnableComponent } from './two-factor-enable.component';

describe('TwoFactorEnableComponent', () => {
  let component: TwoFactorEnableComponent;
  let fixture: ComponentFixture<TwoFactorEnableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoFactorEnableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorEnableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
