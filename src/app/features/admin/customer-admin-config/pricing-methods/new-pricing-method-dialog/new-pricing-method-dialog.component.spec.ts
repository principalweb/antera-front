import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPricingMethodDialogComponent } from './new-pricing-method-dialog.component';

describe('NewPricingMethodDialogComponent', () => {
  let component: NewPricingMethodDialogComponent;
  let fixture: ComponentFixture<NewPricingMethodDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPricingMethodDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPricingMethodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
