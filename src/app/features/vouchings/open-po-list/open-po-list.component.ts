import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DataSource } from '@angular/cdk/table';
import { Subscription } from 'rxjs';
import { VouchingsService } from '../vouchings.service';
import { SelectionService } from 'app/core/services/selection.service';
import { fuseAnimations } from '@fuse/animations';
import { VouchingFormComponent } from '../vouching-form/vouching-form.component';
import { MatDialog } from '@angular/material/dialog';
import { VouchingDetails } from 'app/models/vouching';
import { ApiService } from 'app/core/services/api.service';
import { MessageService } from 'app/core/services/message.service';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';
import { each, isEmpty } from 'lodash';

@Component({
  selector: 'app-open-po-list',
  templateUrl: './open-po-list.component.html',
  styleUrls: ['./open-po-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class OpenPOListComponent implements OnInit, OnDestroy {

  constructor(
    private vouchingsService: VouchingsService,
    public selection: SelectionService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private api: ApiService,
    private msg: MessageService,
    private router: Router,
  )
  {
    this.vouchingsService.poGstEnabled();
    this.filterForm = this.fb.group(this.vouchingsService.params.term);
  }

  onOpenPOsChangedSubscription: Subscription;
  onSelectionChangedSubscription: Subscription;

  displayedColumns = ['checkbox', 'poNumber', 'vendor', 'vouchingStatus', 'amount', 'createdBy', 'dateCreated'];
  filterForm: FormGroup;
  dataSource: POsDataSource;
  checkboxes: any = {};

  loading = false;

  dialogRef: any;
  poList: any[] = [];
  loaded = () => {
      this.loading = false;
  };

  ngOnInit()
  {
    this.dataSource = new POsDataSource(this.vouchingsService);
    this.onOpenPOsChangedSubscription =
        this.vouchingsService.onOpenPOsChanged
            .subscribe(res => {
                this.selection.init(res);
                this.poList = res;
            });

    this.onSelectionChangedSubscription =
        this.selection.onSelectionChanged
            .subscribe(selection => {
                this.checkboxes = selection;
            });
  }

  ngOnDestroy()
  {
      this.onOpenPOsChangedSubscription.unsubscribe();
      this.onSelectionChangedSubscription.unsubscribe();
  }

  onSelectedChange(leadId)
  {
      this.selection.toggle(leadId);
  }

  toggleAll(ev) {
      this.selection.reset(ev.checked);
  }

  filterPOs() {
    this.loading = true;
    this.vouchingsService.filter(this.filterForm.value)
    .subscribe(this.loaded, this.loaded);
  }

  clearFilters() {
    this.filterForm.reset();
    this.filterPOs();
}

  editRow(poData) {
    if (poData.orderId) {
      poData.orders = [poData.orderId];
    } else {
      const ids = this.selection.onSelectionChanged.value;
      each(ids, (v, k) => {
        if (v) {
          const found = this.poList.find(e => e.id === k);
          if (found.id === k) {
            if (!poData.vendorId) {
              poData = found;
              poData.orders = [];
            }
            if (found.vendorId !== poData.vendorId) {
              this.msg.show('Multi vendor selection not allowed!', 'error');
              return;
            }
            const foundOrder = poData.orders.find(o => o === found.orderId);
            if (foundOrder !== found.orderId) {
              poData.orders.push(found.orderId);
            }
          }
        }
      });
      if (poData.orders.length <= 0) {
        this.msg.show('Please select PO', 'error');
        return ;
      }
    }
    this.dialogRef = this.dialog.open(VouchingFormComponent, {
      panelClass: 'antera-details-dialog',
      data      : {
        poData: {...poData},
      },
      maxWidth: '95vw'
    });

    this.dialogRef.afterClosed()
      .subscribe((res) => {
        if (!res) {
          this.filterPOs();
          return;
        }
        if (res.action === 'Preview') {
          const link = '/e-commerce/orders/' + res.data.orderId;
          const queryParams = {displayTab: '1'};
          this.router.navigate([link], {queryParams});
        }
      });
  }

  paginate(pe) {
    this.loading = true;
    this.vouchingsService.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  sort(se) {
    this.loading = true;
    this.vouchingsService.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

}

export class POsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private vouchingsService: VouchingsService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription =
            this.vouchingsService.onOpenPOsCountChanged.pipe(
                    delay(300),
                ).subscribe(c => {
                    this.total = c;
                });

        return this.vouchingsService.onOpenPOsChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
