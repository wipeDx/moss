import { TestBed } from '@angular/core/testing';

import { TwoFAService } from './two-fa.service';

describe('TwoFAService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TwoFAService = TestBed.get(TwoFAService);
    expect(service).toBeTruthy();
  });
});
