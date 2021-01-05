import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingMethodsComponent } from './pricing-methods.component';

describe('PricingMethodsComponent', () => {
  let component: PricingMethodsComponent;
  let fixture: ComponentFixture<PricingMethodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PricingMethodsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PricingMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
