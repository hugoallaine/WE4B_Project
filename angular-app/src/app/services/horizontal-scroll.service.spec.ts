import { TestBed } from '@angular/core/testing';

import { HorizontalScrollService } from './horizontal-scroll.service';

describe('HorizontalScrollService', () => {
  let service: HorizontalScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HorizontalScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
