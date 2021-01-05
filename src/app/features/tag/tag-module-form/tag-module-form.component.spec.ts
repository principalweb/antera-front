import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagModuleFormComponent } from './tag-module-form.component';

describe('TagModuleFormComponent', () => {
  let component: TagModuleFormComponent;
  let fixture: ComponentFixture<TagModuleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagModuleFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagModuleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
