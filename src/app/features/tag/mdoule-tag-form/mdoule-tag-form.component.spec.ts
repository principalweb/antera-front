import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdouleTagFormComponent } from './mdoule-tag-form.component';

describe('MdouleTagFormComponent', () => {
  let component: MdouleTagFormComponent;
  let fixture: ComponentFixture<MdouleTagFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MdouleTagFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MdouleTagFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
