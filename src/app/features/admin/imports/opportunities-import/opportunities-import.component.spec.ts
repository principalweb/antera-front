import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunitiesImportComponent } from './opportunities-import.component';

describe('OpportunitiesImportComponent', () => {
  let component: OpportunitiesImportComponent;
  let fixture: ComponentFixture<OpportunitiesImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpportunitiesImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpportunitiesImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
