import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAdjustmentFormComponent } from './commission-adjustment-form.component';

describe('CommissionAdjustmentFormComponent', () => {
  let component: CommissionAdjustmentFormComponent;
  let fixture: ComponentFixture<CommissionAdjustmentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommissionAdjustmentFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAdjustmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
