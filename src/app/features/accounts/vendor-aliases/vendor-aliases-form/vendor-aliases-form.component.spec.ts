import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorAliasesFormComponent } from './vendor-aliases-form.component';

describe('VendorAliasesFormComponent', () => {
  let component: VendorAliasesFormComponent;
  let fixture: ComponentFixture<VendorAliasesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorAliasesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorAliasesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
