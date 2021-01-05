import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable ,  BehaviorSubject, forkJoin } from 'rxjs';

import { fuseAnimations } from '@fuse/animations';

import { Account } from '../../models';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-related-accounts-dialog',
  templateUrl: './related-accounts-dialog.component.html',
  styleUrls: ['./related-accounts-dialog.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class RelatedAccountsDialogComponent implements OnInit {  
  dataSource: AccountsDataSource;
  displayColumns = ['checkbox', 'accountName', 'partnerType', 'salesRep', 'phone', 'shipState', 'dateCreated'];
  selected: any = {};

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    public dialogRef: MatDialogRef<RelatedAccountsDialogComponent>,
    private api: ApiService,
    private authService: AuthService
  ) {
    this.dataSource = new AccountsDataSource(data.contactId, this.api, this.authService);
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

export class AccountsDataSource extends DataSource<Account>
{
  empty = false;
  params = {
    contactId: '',
    limit: 10,
    offset: 0,
    order: '',
    orient: 'asc',
    term: {},
    permUserId: ''
  }
  contactsList = new BehaviorSubject<Account[]>([]);
  loading = true;
  total = 0;

  constructor(contactId: string, private api: ApiService, private authService: AuthService) {
    super();
    this.params.contactId = contactId;
    this.params.permUserId = this.authService.getCurrentUser().userId;
  }

  connect(): Observable<Account[]> {
    this.getAccountsWithCount();
    return this.contactsList;
  }

  paginate(pe) {
    this.params.offset = pe.pageIndex * pe.pageSize;
    this.params.limit = pe.pageSize;

    this.getAccounts();
  }

  sort(sd) {
    this.params.order = sd.active;
    this.params.orient = sd.direction;

    this.getAccounts();
  }

  disconnect() { }

  private getAccounts() {
    this.loading = true;
    this.api.getRelatedAccounts(this.params).pipe(
        delay(100),
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

  private getAccountsWithCount() {
    this.loading = true;
    forkJoin([
      this.api.getRelatedAccounts(this.params),
      this.api.getRelatedAccountsCount(this.params)
    ]).pipe(
      delay(100),
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
