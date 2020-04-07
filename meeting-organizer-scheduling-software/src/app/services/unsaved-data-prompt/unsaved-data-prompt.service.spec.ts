import { TestBed } from '@angular/core/testing';

import { UnsavedDataPromptService } from './unsaved-data-prompt.service';

describe('UnsavedDataPromptService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UnsavedDataPromptService = TestBed.get(UnsavedDataPromptService);
    expect(service).toBeTruthy();
  });
});
