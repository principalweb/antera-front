import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFormPricingMarginComponent } from './product-form-pricing-margin.component';

describe('ProductFormPricingMarginComponent', () => {
  let component: ProductFormPricingMarginComponent;
  let fixture: ComponentFixture<ProductFormPricingMarginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductFormPricingMarginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductFormPricingMarginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
