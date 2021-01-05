import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingMethodsQtyBreaksDialogComponent } from './pricing-methods-qty-breaks-dialog.component';

describe('PricingMethodsQtyBreaksDialogComponent', () => {
  let component: PricingMethodsQtyBreaksDialogComponent;
  let fixture: ComponentFixture<PricingMethodsQtyBreaksDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PricingMethodsQtyBreaksDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingMethodsQtyBreaksDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
