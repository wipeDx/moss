import { TestBed } from '@angular/core/testing';

import { IcsService } from './ics.service';

describe('IcsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IcsService = TestBed.get(IcsService);
    expect(service).toBeTruthy();
  });
});
