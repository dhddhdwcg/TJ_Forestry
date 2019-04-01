import { TestBed } from '@angular/core/testing';

import { AppState } from './app.service';

describe('AppState', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AppState = TestBed.get(AppState);
    expect(service).toBeTruthy();
  });
});
