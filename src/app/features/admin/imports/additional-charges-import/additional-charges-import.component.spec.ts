import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalChargesImportComponent } from './additional-charges-import.component';

describe('AdditionalChargesImportComponent', () => {
  let component: AdditionalChargesImportComponent;
  let fixture: ComponentFixture<AdditionalChargesImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalChargesImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalChargesImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
