import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagStoreFormComponent } from './tag-store-form.component';

describe('TagStoreFormComponent', () => {
  let component: TagStoreFormComponent;
  let fixture: ComponentFixture<TagStoreFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagStoreFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagStoreFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
