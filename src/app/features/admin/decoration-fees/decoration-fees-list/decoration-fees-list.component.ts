import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Subscription } from 'rxjs';
import { DecorationFeesService } from '../decoration-fees.service';
import { SelectionService } from 'app/core/services/selection.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { DecorationChargeDetails } from 'app/models/decoration-charge';
import { DecorationFeeFormComponent } from '../decoration-fee-form/decoration-fee-form.component';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-decoration-fees-list',
  templateUrl: './decoration-fees-list.component.html',
  styleUrls: ['./decoration-fees-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class DecorationFeesListComponent implements OnInit {

    onDecoChargesChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    filterForm: FormGroup;
    dataSource: DecorationFeesDataSource;
    checkboxes: any = {};
    displayedColumns = ['checkbox', 'name', 'vendorName', 'decoratorType', 'stitchesStart', 'stitchesUpto', 'decorationDetail', 'qunatityStart', 'quantityUpto', 'price', 'salePrice', 'setupCharge', 'setupChargeSalePrice', 'buttons'];
    dialogRef: MatDialogRef<DecorationFeeFormComponent>;
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    loading = false;
    loaded = () => {
        this.loading = false;
    };

    constructor(
        private decoChargesService: DecorationFeesService,
        public selection: SelectionService,
        private api: ApiService,
        private fb: FormBuilder,
        public dialog: MatDialog,
    ) 
    {
        this.filterForm = this.fb.group(this.decoChargesService.params.term);
    }

    ngOnInit() 
    {
        this.dataSource = new DecorationFeesDataSource(this.decoChargesService);
        this.onDecoChargesChangedSubscription =
            this.decoChargesService.onDecoChargesChanged
                .subscribe(decoCharges => {
                    console.log("Deco Charges ->",decoCharges);
                    this.selection.init(decoCharges);
                });

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged
                .subscribe(selection => {
                    this.checkboxes = selection;
                });
    }

    ngOnDestroy()
    {
        this.onDecoChargesChangedSubscription.unsubscribe();
        this.onDecoChargesChangedSubscription.unsubscribe();
    }

    onSelectedChange(leadId)
    {
        this.selection.toggle(leadId);
    }
    
    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterDecoCharges() {
        this.loading = true;
        this.decoChargesService.filter(this.filterForm.value)
        .subscribe(this.loaded, this.loaded);
    }

    clearFilters() {
        this.filterForm.reset();
        this.filterDecoCharges();
    }

    sort(se) {
        this.loading = true;
        this.decoChargesService.sort(se)
            .subscribe(this.loaded, this.loaded);
    }

    paginate(pe) {
        this.loading = true;
        this.decoChargesService.setPagination(pe)
            .subscribe(this.loaded, this.loaded);
    }

    editDecoCharge(decoCharge) {
        this.api.getDecoChargeDetail(decoCharge.id)
            .subscribe((data: any) => {
                const decoChargeData = new DecorationChargeDetails(data);
                this.dialogRef = this.dialog.open(DecorationFeeFormComponent, {
                    panelClass: 'antera-details-dialog',
                    data: {
                        decoChargeDetails: decoChargeData,
                        action : 'edit',
                    }
                });

                this.dialogRef.afterClosed()
                    .subscribe(response => {
                        if ( !response )
                        {
                            return;
                        }
        
                        const actionType: string = response[0];
                        const decoCharge: DecorationChargeDetails = response[1];
                        switch ( actionType )
                        {
                            case 'save':
                                this.loading = true;
                                this.decoChargesService.updateDecoCharge(decoCharge)
                                    .subscribe(this.loaded, this.loaded);
                                break;
                            case 'delete':
                                this.deleteDecoCharge(decoCharge);
                                break;
                        }
                    });
            })
    }

    deleteDecoCharge(decoCharge)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.loading = true;
                this.decoChargesService.deleteDecoCharge(decoCharge.id)
                    .subscribe(this.loaded, this.loaded);
            }
            this.confirmDialogRef = null;
        });
    }
}

export class DecorationFeesDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private decoChargesService: DecorationFeesService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.decoChargesService.onDecoChargesCountChanged.pipe(
                delay(300)
            ).subscribe(c => {
                this.total = c;
            });

        return this.decoChargesService.onDecoChargesChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
