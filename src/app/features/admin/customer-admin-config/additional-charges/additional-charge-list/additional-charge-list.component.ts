import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { SelectionService } from 'app/core/services/selection.service';
import { DataSource } from '@angular/cdk/table';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { AdditionalChargesService } from '../additional-charges.service';
import { AdditionalCharge } from 'app/models/additional-charge-extend';
import { AdditionalChargeFormComponent } from '../additional-charge-form/additional-charge-form.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-additional-charge-list',
  templateUrl: './additional-charge-list.component.html',
  styleUrls: ['./additional-charge-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class AdditionalChargeListComponent implements OnInit {

  onAdditionalChargesChanged: Subscription;
  onSelectionChangedSubscription: Subscription;

  filterForm: FormGroup;
  dataSource: AdditionalChargeDataSource;
  checkboxes: any = {};
  displayedColumns = ['checkbox', 'name', 'description', 'status', 'cost', 'price', 'item', 'itemCode', 'dateModified', 'modifiedByName'];
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  loading = false;
  loaded = () => {
      this.loading = false;
  };

  dialogRef: any;

  constructor(
    private addChargesService: AdditionalChargesService,
    public selection: SelectionService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private api: ApiService,
  ) 
  { 
    this.filterForm = this.fb.group(this.addChargesService.params.term);
  }

  ngOnInit() 
  {
    this.dataSource = new AdditionalChargeDataSource(this.addChargesService);
    
    this.onAdditionalChargesChanged =
      this.addChargesService.onAdditionalChargesChanged
          .subscribe(dropdowns => {
              this.selection.init(dropdowns);
          });

    this.onSelectionChangedSubscription =
      this.selection.onSelectionChanged
          .subscribe(selection => {
              this.checkboxes = selection;
          });
          
    this.filterDecoAddonCharges();
  }

  ngOnDestroy()
  {
    this.onAdditionalChargesChanged.unsubscribe();
  }

  onSelectedChange(dropdownId)
  {
    this.selection.toggle(dropdownId);
  }
  
  toggleAll(ev) {
    this.selection.reset(ev.checked);
  }

  filterDecoAddonCharges() {
    this.loading = true;
    this.addChargesService.filter(this.filterForm.value)
        .subscribe(this.loaded, this.loaded);
  }

  clearFilters() {
    this.filterForm.reset();
    this.filterDecoAddonCharges();
  }

  sort(se) {
    this.loading = true;
    this.addChargesService.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  paginate(pe) {
    this.loading = true;
    this.addChargesService.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  filterAdditionalCharges() {
    this.loading = true;
    this.addChargesService.filter(this.filterForm.value)
        .subscribe(this.loaded, this.loaded);
  }

  editAdditionalCharge(id) {
    this.loading = true;
    this.api.getAdditionalChargeDetail(id)
        .subscribe((data: any) => {
            this.loading = false;
            if (!data.taxable) 
                data.taxable = 1;
            if (!data.commissionable)
                data.commissionable = 1;
            const addChargeDetail = new AdditionalCharge(data);
            this.dialogRef = this.dialog.open(AdditionalChargeFormComponent, {
                panelClass: 'antera-details-dialog',
                data      : {
                    addChargeDetails: addChargeDetail,
                    action : 'edit',
                }
            });
    
            this.dialogRef.afterClosed()
                .subscribe((addChargeDetail: AdditionalCharge) => {
                    if (!addChargeDetail) return;
                    this.updateAdditionalCharge(addChargeDetail);
                });
        });
  }
  
  updateStatus(addChargeDetail, ev) {
    ev.stopPropagation();
    this.api.getAdditionalChargeDetail(addChargeDetail.id)
        .subscribe(data => {
          const additionalCharge = new AdditionalCharge(data);
          additionalCharge.status = !additionalCharge.status;
          this.updateAdditionalCharge(additionalCharge);
        });
  }
  
  updateAdditionalCharge(addChargeDetail) {
    this.loading = true;
    this.addChargesService.updateAdditionalCharge(addChargeDetail)
        .subscribe(this.loaded, this.loaded);
  }
}

export class AdditionalChargeDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private decoLocationsService: AdditionalChargesService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.decoLocationsService.onAdditionalChargesCountChanged.pipe(
              delay(300)
            ).subscribe(c => {
              this.total = c;
            });

        return this.decoLocationsService.onAdditionalChargesChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
