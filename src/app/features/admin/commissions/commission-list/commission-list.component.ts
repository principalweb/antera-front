import { Component, OnInit, ViewEncapsulation, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommissionsService } from '../commissions.service';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { Commission } from 'app/models/commission';
import { MatDialog } from '@angular/material/dialog';
import { CommissionFormComponent } from '../commission-form/commission-form.component';
import { EventEmitter } from 'events';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-commission-list',
  templateUrl: './commission-list.component.html',
  styleUrls: ['./commission-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations,
})
export class CommissionListComponent implements OnInit {

  onCommissionsChanged: Subscription;
  onSelectionChangedSubscription: Subscription;

  filterForm: FormGroup;
  dataSource: CommissionsDataSource;
  checkboxes: any = {};
  //displayedColumns = ['checkbox', 'name', 'description', 'assignedSalesRep', 'orderGP', 'profitTarget', 'profitPercent', 'netProfitPercent', 'revenue', 'cap', 'calulationType', 'modifiedByName'];
  displayedColumns = ['checkbox', 'name', 'description', 'assignedSalesRep', 'profitTarget', 'profitPercent', 'revenueTarget', 'revenue', 'cap', 'modifiedByName'];

  @Input() clickAction: string = 'edit';
  @Input() changesResetSelection: boolean = true;
  @Input() showFilters: boolean = true;

  loading = false;
  loaded = () => {
      this.loading = false;
  };

  dialogRef: any;

  constructor(
    private commissionsService: CommissionsService,
    public selection: SelectionService,
    private fb: FormBuilder,
    private api: ApiService,
    public dialog: MatDialog,
  ) 
  {
    this.filterForm = this.fb.group(this.commissionsService.params.term);
  }

  ngOnInit() {
    this.dataSource = new CommissionsDataSource(this.commissionsService);
    
    this.onCommissionsChanged =
      this.commissionsService.onCommissionsChanged
          .subscribe(commissions => {
              this.selection.init(commissions);
          });

    this.onSelectionChangedSubscription =
      this.selection.onSelectionChanged
          .subscribe(selection => {
              this.checkboxes = selection;
          });
          
    this.filterCommissions();
  }

  ngOnDestroy()
  {
    this.onCommissionsChanged.unsubscribe();
  }

  onSelectedChange(id)
  {
    this.selection.toggle(id);
  }
  
  toggleAll(ev) {
    this.selection.reset(ev.checked);
  }

  filterCommissions() {
    this.loading = true;
    this.commissionsService.filter(this.filterForm.value)
        .subscribe(this.loaded, this.loaded);
  }

  clearFilters() {
    this.filterForm.reset();
    this.filterCommissions();
  }

  sort(se) {
    this.loading = true;
    this.commissionsService.filter(this.filterForm.value)
    this.commissionsService.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  paginate(pe) {
    this.loading = true;
    this.commissionsService.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  commissionClicked(id) {
    if (this.clickAction === 'edit') {
      this.editCommission(id);
    }
    if (this.clickAction === 'select') {
      this.selection.toggle(id);
    }
  }

  editCommission(id) {
    this.loading = true;
    this.api.getCommissionDetail(id)
        .subscribe((data: any) => {
            this.loading = false;
            const commissionDetail = new Commission(data);
            this.dialogRef = this.dialog.open(CommissionFormComponent, {
                panelClass: 'antera-details-dialog',
                data      : {
                    commissionDetails: commissionDetail,
                    action : 'edit',
                }
            });
    
            this.dialogRef.afterClosed()
                .subscribe((commissionDetail: Commission) => {
                    if (!commissionDetail) return;
                    this.updateCommmissionDetail(commissionDetail);
                });
        });
  }

  updateCommmissionDetail(commissionDetail) {
    this.loading = true;
    this.commissionsService.updateCommission(commissionDetail)
        .subscribe(this.loaded, this.loaded);
  }
}

export class CommissionsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private commissionsService: CommissionsService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.commissionsService.onCommissionsCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                    this.total = c;
                });

        return this.commissionsService.onCommissionsChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
