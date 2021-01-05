import { Component, OnInit, OnChanges, OnDestroy, ViewEncapsulation, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from '../../../core/services/api.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SupportTicketsService } from '../support-tickets.service';
import { forkJoin } from 'rxjs';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-support-tickets-list',
  templateUrl: './support-tickets-list.component.html',
  styleUrls: ['./support-tickets-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SupportTicketsListComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  users= [];
  customers = [];
  dataSource: MatTableDataSource<any>;
  userTickets = [];
  displayedColumns = ['company', 'subject', 'createdAt', 'updatedAt', 'status'];
  loading = false;
  ticketStatus = 'active';
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private authService: AuthService,
    private service: SupportTicketsService,
    private msg: MessageService,
  ) {   
     this.dataSource = new MatTableDataSource<any>([]);
     this.dataSource.paginator = this.paginator;
     this.dataSource.sort = this.sort;    
     this.loadCustomerDetail();  
   }

   loadCustomerDetail() {
    this.loading = true;
    let user = this.authService.getCurrentUser();
    this.api.getTeamWorkAPICustomer(user.email).subscribe((res:any) => {
      if(res.status && res.status === 'error') {
        this.loading = false;
        this.msg.show(res.msg, 'error');
      } else {
        this.loading = false;
        this.customers = res.customers;
        this.loadCustomerTickets('active');
      }
      
    }, err => {
      this.loading = false;
      this.msg.show('Something went wrong!', 'error');
    });
   }
   
   loadCustomers(users) {
    this.loading = true;
    this.api.getTeamWorkAPICustomer(users.email).subscribe((response: any) => {
      if(response.status && response.status === 'error') {
        this.loading = false;
        this.msg.show(response.msg, 'error');
      } else { 
        this.customers = response.customers;
        this.loading = false;
        this.loadCustomerTickets(this.ticketStatus);
      }
     }, err => {
        this.loading = false;
        this.msg.show('Something went wrong!', 'error');
      });
   }

  loadCustomerTickets(status) {
    this.ticketStatus = status;
    this.loading = true;
    forkJoin(
      this.customers.map(p =>
        this.api.getTeamWorkAPICustomersTickets(p.id).pipe(
          map((response: any) => response.tickets.map(ticket => {
            if(ticket.status === status) {
              return ticket;
            } else {
              return null;
            }
          }))
        )
      )
    ).subscribe((p: []) => {
      const updatedProviders = [].concat(...p);
      this.dataSource.data = updatedProviders.filter(function (el) {
        return el != null;
      });
      this.loading = false;
      
    }, err => {
      this.loading = false;
      this.msg.show('Something went wrong!', 'error');
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

}
