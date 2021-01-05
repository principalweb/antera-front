import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPriceRangeDialogComponent } from './new-price-range-dialog.component';

describe('NewPriceRangeDialogComponent', () => {
  let component: NewPriceRangeDialogComponent;
  let fixture: ComponentFixture<NewPriceRangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewPriceRangeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPriceRangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
