import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAdjustmentsComponent } from './commission-adjustments.component';

describe('CommissionAdjustmentsComponent', () => {
  let component: CommissionAdjustmentsComponent;
  let fixture: ComponentFixture<CommissionAdjustmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommissionAdjustmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAdjustmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
