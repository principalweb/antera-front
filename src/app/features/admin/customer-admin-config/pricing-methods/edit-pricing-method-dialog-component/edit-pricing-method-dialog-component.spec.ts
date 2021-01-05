import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPricingMethodDialogComponent } from './edit-pricing-method-dialog-component';

describe('EditPricingMethodDialogComponent', () => {
  let component: EditPricingMethodDialogComponent;
  let fixture: ComponentFixture<EditPricingMethodDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditPricingMethodDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPricingMethodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
