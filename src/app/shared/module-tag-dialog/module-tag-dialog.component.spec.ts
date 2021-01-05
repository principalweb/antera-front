import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleTagDialogComponent } from './module-tag-dialog.component';

describe('ModuleTagDialogComponent', () => {
  let component: ModuleTagDialogComponent;
  let fixture: ComponentFixture<ModuleTagDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuleTagDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModuleTagDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
