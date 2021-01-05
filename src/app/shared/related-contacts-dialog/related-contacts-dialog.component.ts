import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable ,  BehaviorSubject, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { Contact } from '../../models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-related-contacts-dialog',
  templateUrl: './related-contacts-dialog.component.html',
  styleUrls: ['./related-contacts-dialog.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class RelatedContactsDialogComponent implements OnInit {  
  dataSource: ContactsDataSource;
  displayColumns = ['checkbox', 'name', 'title', 'email', 'phone', 'sales'];
  selected: any = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialogRef: MatDialogRef<RelatedContactsDialogComponent>,
    private api: ApiService,
    private authService: AuthService
  ) {
    this.dataSource = new ContactsDataSource(data.accountId, this.api, this.authService);
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
  }

  save() {
    this.dialogRef.close(this.selected);
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
    this.params.offset = pe.pageIndex;
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
