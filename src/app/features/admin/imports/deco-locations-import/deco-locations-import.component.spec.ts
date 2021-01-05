import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecoLocationsImportComponent } from './deco-locations-import.component';

describe('DecoLocationsImportComponent', () => {
  let component: DecoLocationsImportComponent;
  let fixture: ComponentFixture<DecoLocationsImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecoLocationsImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecoLocationsImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
