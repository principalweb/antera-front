import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommissionPlansImportComponent } from './commission-plans-import.component';

describe('CommissionPlansImportComponent', () => {
  let component: CommissionPlansImportComponent;
  let fixture: ComponentFixture<CommissionPlansImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommissionPlansImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommissionPlansImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
