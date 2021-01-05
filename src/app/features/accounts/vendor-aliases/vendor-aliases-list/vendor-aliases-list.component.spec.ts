import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorAliasesListComponent } from './vendor-aliases-list.component';

describe('VendorAliasesListComponent', () => {
  let component: VendorAliasesListComponent;
  let fixture: ComponentFixture<VendorAliasesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorAliasesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorAliasesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
