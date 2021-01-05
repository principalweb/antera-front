import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagTypeFormComponent } from './tag-type-form.component';

describe('TagTypeFormComponent', () => {
  let component: TagTypeFormComponent;
  let fixture: ComponentFixture<TagTypeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagTypeFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagTypeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
