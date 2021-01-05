import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPricingEditorComponent } from './product-pricing-editor.component';

describe('ProductPricingEditorComponent', () => {
  let component: ProductPricingEditorComponent;
  let fixture: ComponentFixture<ProductPricingEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductPricingEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPricingEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
