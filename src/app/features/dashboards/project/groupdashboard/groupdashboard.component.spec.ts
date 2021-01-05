import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupdashboardComponent } from './groupdashboard.component';

describe('GroupdashboardComponent', () => {
  let component: GroupdashboardComponent;
  let fixture: ComponentFixture<GroupdashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupdashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
