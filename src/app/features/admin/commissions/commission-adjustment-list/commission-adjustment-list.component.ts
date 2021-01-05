import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription ,  forkJoin } from 'rxjs';
import { CommissionAdjustmentService } from '../commission-adjustment.service';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { delay } from 'rxjs/operators';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommissionAdjustmentFormComponent } from '../commission-adjustment-form/commission-adjustment-form.component';

@Component({
  selector: 'app-commission-adjustment-list',
  templateUrl: './commission-adjustment-list.component.html',
  styleUrls: ['./commission-adjustment-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class CommissionAdjustmentListComponent implements OnInit {

  onCommissionsChanged: Subscription;
  onSelectionChangedSubscription: Subscription;
  dataSource: CommissionAdjustmentsDataSource;
  checkboxes: any = {};
  loading = false;
  loaded = () => {
      this.loading = false;
  };
  displayedColumns = ['checkbox', 'adjustmentType', 'adjustmentValue', 'salesRep', 'reason'];
  dialogRef: any;
  filterForm: FormGroup;

  constructor(
    private service: CommissionAdjustmentService,
    public selection: SelectionService,
    private fb: FormBuilder,
    private api: ApiService,
    public dialog: MatDialog,
  ) {
    this.filterForm = this.fb.group(this.service.params.term);
  }

  ngOnInit(): void {
    this.dataSource = new CommissionAdjustmentsDataSource(this.service);
    this.onCommissionsChanged =
      this.service.onEntitiesChanged
          .subscribe(groups => {
              this.selection.init(groups);
          });

    this.onSelectionChangedSubscription =
      this.selection.onSelectionChanged
          .subscribe(selection => {
              this.checkboxes = selection;
          });

    this.filterCommissions();
  }

  onSelectedChange(dropdownId)
  {
    this.selection.toggle(dropdownId);
  }

  toggleAll(ev) {
    this.selection.reset(ev.checked);
  }

  filterCommissions() {
    this.loading = true;
    this.service.filter(this.filterForm.value)
        .subscribe(this.loaded, this.loaded);
  }

  clearFilters() {
    this.filterForm.reset();
    this.filterCommissions();
  }

  paginate(pe) {
    this.loading = true;
    this.service.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  sort(se) {
    this.loading = true;
    this.service.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  edit(id) {
    this.loading = true;

    forkJoin([
      this.api.getCommissionAdjustmentDetail(id),
    ]).subscribe(([data]: any) => {
      console.log("data",data);
            this.loading = false;
            const commissionAdjustment = data;
            this.dialogRef = this.dialog.open(CommissionAdjustmentFormComponent, {
                panelClass: 'antera-details-dialog',
                height: '80%',
                data      : {
                  commissionAdjustment: commissionAdjustment,
                  action : 'edit',
                }   
            });
    
            this.dialogRef.afterClosed()
                .subscribe((adjustment: any) => {
                    if (!adjustment) { 
                      return; 
                    }
                    this.updateCommissionAdjustment(adjustment);
                });
        });
  }

  updateCommissionAdjustment(data) {
    this.loading = true;
    this.service.update(data)
        .subscribe(this.loaded, this.loaded);
  }
}
export class CommissionAdjustmentsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private service: CommissionAdjustmentService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.service.onEntitiesCountChanged.pipe(
              delay(300),
            ).subscribe(c => {
              this.total = c;
            });

        return this.service.onEntitiesChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
