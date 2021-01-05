import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { switchMap, distinctUntilChanged, debounceTime,map, catchError } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from '../../core/services/api.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SupportTicketsService } from './support-tickets.service';
import { SupportTicketsListComponent } from './support-tickets-list/support-tickets-list.component';
import { Subscription } from 'rxjs';
import { FormControl } from '@angular/forms';
import { unionBy, sortBy } from 'lodash';

@Component({
  selector: 'app-support-tickets',
  templateUrl: './support-tickets.component.html',
  styleUrls: ['./support-tickets.component.scss'],
  animations   : fuseAnimations
})
export class SupportTicketsComponent implements OnInit {
  @ViewChild(SupportTicketsListComponent) supportTicketList: SupportTicketsListComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  users= [];
  customers = [];
  dataSource: MatTableDataSource<any>;
  userTickets = [];
  ticketStatus: any;
  status = 'active'
  assignees = [];
  assigneeSearch = new FormControl('');
  onAssigneeSearch: Subscription;
  isLoading = false;
  selectedAssignees = [];

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private service: SupportTicketsService
  ) {

    let headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer tkn.v1_MjM0NmJiNzAtOTI5OC00Nzk2LWI5MWUtM2ZkMGJiNjNiZDYzLTQwOTA4My4yNDU0MjYuVVM=' }
    this.http.get('https://anterasoftwareusa.teamwork.com/desk/v1/ticketstatuses.json', {headers: headers})
            .subscribe((res:any) => {
              this.ticketStatus = res.ticketstatuses;
      });
 
  }

  ngOnInit() {
    this.selectedAssignees = this.service.assigneeFilter;
    this.assignees = this.selectedAssignees;
    this.onAssigneeSearch =
      this.assigneeSearch.valueChanges.pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(searchText => {
              this.isLoading = true;
              return this.service.getUserAutoCompleteRequest(searchText)
          }),
      ).subscribe((users: any[]) => {
          this.isLoading = false;
          if(users && users.length > 0) {
            this.assignees = unionBy([
              ...this.selectedAssignees,
              ...users
          ]);
          }
          
      });
   
  }

  changeAssignees() {
    this.supportTicketList.loadCustomers(this.selectedAssignees);   
  }

  selectStatus(ev) {
    this.supportTicketList.loadCustomerTickets(ev.value)
  }

}
