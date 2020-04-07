import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IcsComponent } from './ics.component';

describe('IcsComponent', () => {
  let component: IcsComponent;
  let fixture: ComponentFixture<IcsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IcsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IcsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
