import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFormPricingLevelComponent } from './product-form-pricing-level.component';

describe('ProductFormPricingLevelComponent', () => {
  let component: ProductFormPricingLevelComponent;
  let fixture: ComponentFixture<ProductFormPricingLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductFormPricingLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductFormPricingLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
