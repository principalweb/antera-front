import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable ,  BehaviorSubject, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { Contact } from '../../models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { delay } from 'rxjs/operators';
import { SelectionService } from 'app/core/services/selection.service';
import { MessageService } from 'app/core/services/message.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-contacts-list-dialog',
  templateUrl: './contacts-list-dialog.component.html',
  styleUrls: ['./contacts-list-dialog.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None  
})
export class ContactsListDialogComponent implements OnInit {
  dataSource: ContactsDataSource;
  displayColumns = ['checkbox', 'name', 'title', 'email', 'phone', 'sales'];
  selected: any = {};
  checkboxes: any = {};
  onSelectionChangedSubscription: Subscription;
  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private api: ApiService,
    private authService: AuthService,
    public selection: SelectionService,    
    private msg: MessageService,
  ) {
    this.selection.reset(false);
    this.dataSource = new ContactsDataSource(data.accountId, this.api, this.authService);
    /*
    this.selection.init(this.dataSource.contactsList);
    this.onSelectionChangedSubscription =
    this.selection.onSelectionChanged
	.subscribe(selection => {	 	    
	});
    */	
  }

  ngOnInit() {

  }

  sortChange(ev) {
    this.dataSource.sort(ev);
  }


  paginate(ev) {
    this.dataSource.paginate(ev);
  }

  changeSelected(c) {
    this.selected = c;
    this.selection.toggle(c.id);     
  }
  toggleAll(ev) {
    this.selection.reset(ev.checked);
  }
  save() {
    //this.dialogRef.close(this.selected);
  }

  insertSelectedUsers(){
    console.log(this.selection.selectedIds);
  //  console.log(this.selection.selectedIds.length);
    if(this.selection.selectedIds.length > 0){

    }else{
        this.msg.show('Please select contacts', 'error');
    }
  }  
}

export class ContactsDataSource extends DataSource<Contact>
{
  empty = false;
  params = {
    accountId: '',
    limit: 10,
    offset: 0,
    order: '',
    orient: 'asc',
    term: {},
    permUserId: ''
  }
  contactsList = new BehaviorSubject<Contact[]>([]);
  loading = true;
  total = 0;

  constructor(accId: string, private api: ApiService, private authService: AuthService) {
    super();
    this.params.accountId = accId;
    this.params.permUserId = this.authService.getCurrentUser().userId;
  }

  connect(): Observable<Contact[]> {
    this.getContactsWithCount();
    return this.contactsList;
  }

  paginate(pe) {
    this.params.offset = pe.pageIndex * pe.pageSize;
    this.params.limit = pe.pageSize;

    this.getContacts();
  }

  sort(sd) {
    this.params.order = sd.active;
    this.params.orient = sd.direction;

    this.getContacts();
  }

  disconnect() { }

  private getContacts() {
    this.loading = true;
    this.api.getRelatedContacts(this.params).pipe(
        delay(100)
    ).subscribe(
      (res: any) => {
        this.loading = false;
        this.contactsList.next(res);
      },
      err => {
        this.loading = false;
        console.log(err);
      }
    );
  }

  private getContactsWithCount() {
    this.loading = true;
    forkJoin([
      this.api.getRelatedContacts(this.params),
      this.api.getRelatedContactsCount(this.params)
    ]).pipe(
      delay(100)
    ).subscribe(
      (res: any[]) => {
        this.contactsList.next(res[0]);
        this.total = res[1].count;
        this.loading = false;
      },
      err => {
        this.loading = false;
        console.log(err);
      }
    )
  }
}
