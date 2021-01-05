import { Component, Input, ViewEncapsulation, EventEmitter, Output, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { OrderDetails } from 'app/models';
import { EcommerceBillingService } from 'app/core/services/billing.service';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { SelectionService } from 'app/core/services/selection.service';

@Component({
    selector     : 'fuse-scrumboard-board-list',
    templateUrl  : './list.component.html',
    styleUrls    : ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseScrumboardBoardListComponent implements OnInit
{
    dialogRef: any;

    @Input() condensed = true;
    @Input() list = [];
    @Input() stage;

    @Output() dragStart = new EventEmitter();
    @Output() selectCard = new EventEmitter();
    
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(
        public dialog: MatDialog,
        private service: EcommerceBillingService,
        private router: Router,
        public selection: SelectionService
    )
    {
    }

    ngOnInit() {
        this.selection.reset(false);
    }

    removeList()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete the list and it\'s all cards?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                if (this.list) {
                    this.list.forEach(card => {
                        // this.service.deleteBilling(card);
                    });
                }
                this.service.removeStatus(this.stage);
            }
        });
    }

    deleteBilling(billing)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this Billing?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.service.deleteBilling([billing.id])
                    .subscribe(() => {})
            }
            this.confirmDialogRef = null;
        });
    }

    editBilling(billing)
    {
        this.router.navigate(['/e-commerce/billing', billing.id]);
    }

    onDrop(ev)
    {
        const billing = ev.value;
        this.service.updateOrderBillingStage(billing.id, this.stage.value).subscribe(() => {});
    }

    onListNameChanged(ev)
    {
        
    }

    onSelectCard(card, selected) {
        this.selectCard.emit({card, selected});
    }

    tooltip(card) {
        if (this.condensed) {
            let text  = '';
            text += card.name + '\n';

            return text;
        }
        return null;
    }

    total(list){
        if (!list)
            return 0;
            return list.length;
        let t = 0;
        list.forEach(card => {
            t += parseFloat(card.itemNumber);
        });
        return t;
    }

    cloneOrder()
    {

    }

    toggleAll(ev) {
        //this.selection.reset(ev.checked);        
    }
}
