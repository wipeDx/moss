import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TwoFactorDisableComponent } from './two-factor-disable.component';

describe('TwoFactorDisableComponent', () => {
  let component: TwoFactorDisableComponent;
  let fixture: ComponentFixture<TwoFactorDisableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoFactorDisableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoFactorDisableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
