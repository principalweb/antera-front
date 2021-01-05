import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionAdjustmentListComponent } from './commission-adjustment-list.component';

describe('CommissionAdjustmentListComponent', () => {
  let component: CommissionAdjustmentListComponent;
  let fixture: ComponentFixture<CommissionAdjustmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommissionAdjustmentListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionAdjustmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
