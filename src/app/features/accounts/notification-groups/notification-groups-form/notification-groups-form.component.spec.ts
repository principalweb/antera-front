import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationGroupsFormComponent } from './notification-groups-form.component';

describe('NotificationGroupsFormComponent', () => {
  let component: NotificationGroupsFormComponent;
  let fixture: ComponentFixture<NotificationGroupsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationGroupsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationGroupsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
