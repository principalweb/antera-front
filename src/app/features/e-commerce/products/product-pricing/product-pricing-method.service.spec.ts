import { TestBed } from '@angular/core/testing';

import { ProductPricingMethodService } from './product-pricing-method.service';

describe('ProductPricingMethodService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProductPricingMethodService = TestBed.get(ProductPricingMethodService);
    expect(service).toBeTruthy();
  });
});
