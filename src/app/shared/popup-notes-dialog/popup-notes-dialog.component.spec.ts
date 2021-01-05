import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupNotesDialogComponent } from './popup-notes-dialog.component';

describe('PopupNotesDialogComponent', () => {
  let component: PopupNotesDialogComponent;
  let fixture: ComponentFixture<PopupNotesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopupNotesDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupNotesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
