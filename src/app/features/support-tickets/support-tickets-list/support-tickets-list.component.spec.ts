import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportTicketsListComponent } from './support-tickets-list.component';

describe('SupportTicketsListComponent', () => {
  let component: SupportTicketsListComponent;
  let fixture: ComponentFixture<SupportTicketsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupportTicketsListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportTicketsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
