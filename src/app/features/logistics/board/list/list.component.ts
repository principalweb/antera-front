import { Component, Input, ViewEncapsulation, EventEmitter, Output, OnInit, OnDestroy, AfterViewInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { LogisticFormDialogComponent } from '../../logistics-form/logistics-form.component';
import { Logistic } from '../../../../models';
import { LogisticsService } from 'app/core/services/logistics.service';
import { ApiService } from 'app/core/services/api.service';
import { find } from 'lodash';
import { switchMap } from 'rxjs/operators';

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
        private service: LogisticsService,
        private api: ApiService
    )
    {
    }

    ngOnInit() {
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
                        // this.service.deleteLogistic(card);
                    });
                }
                this.service.removeStatus(this.stage);
            }
        });
    }

    deleteLogistic(logistic)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this logistic?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.service.deleteLogistics([logistic.id])
                    .subscribe(() => {})
            }
            this.confirmDialogRef = null;
        });
    }

    editLogistic(logistic)
    {
        this.service.getLogistic(logistic.id)
            .subscribe((data) => {
                const logistic1 = new Logistic(data);

                this.dialogRef = this.dialog.open(LogisticFormDialogComponent, {
                    panelClass: 'logistics-form-dialog',
                    data      : {
                        logistic: logistic1,
                        action : 'edit',
                        service: this.service
                    }
                });
        
                this.dialogRef.afterClosed()
                    .subscribe(response => {
                        if ( !response )
                        {
                            return;
                        }
        
                        switch ( response[0] )
                        {
                            case 'save':
                                this.service.updateLogistic(response[1])
                                    .subscribe(() => {});
                                break;
        
                            case 'delete':
                                this.deleteLogistic(logistic1);
                                break;
                        }
                    });
            });
    }

    onDrop(ev)
    {
        const logistic = ev.value;

        console.group('logistics');
        console.log('Logistic', logistic);

        switch (this.stage.stageKey) {
            case 'Pending': 
                console.log('Factory Ready Date', 'Ref #', 'Expected Carton Count', 'Expected Piece Count');
                break;
            case 'ConfirmedBooked': 
                console.log('ETA');
                // Move to in transit
                break;
            case 'In Transit': 
                console.log('ATA');
                // Can move to customs
                break;
            case 'Customs':
                console.log('CDD', 'Cleared', 'Available');
                // If CCD and Cleared & Available move to "Dispatched"
                break;
            case 'Dispatched':
                console.log('Pro #', 'PUD', 'PDD', 'ADD');
                // If all are filled status moves to delivered
                break;
            case 'Delivered': 
                console.log('Upload POD');
                break;
            default:
                console.log('Show whole form');
        }

        console.groupEnd();

        this.service.getLogistic(logistic.id).pipe(
            switchMap((item: any) => {
                item.status = this.stage.stageKey;
                return this.service.updateLogistic(item);
            }),
        ).subscribe(() => {});

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
        let t = 0;
        list.forEach(card => {
            t += parseFloat(card.amount);
        });
        return t;
    }
}

@Component({
    selector: 'dialog-overview-example-dialog',
    template: `
    <div mat-dialog-content>
        <div fxLayout="column">
            <p>Please select the reason for loss.</p>
            <mat-form-field fxFlex>
                <mat-select 
                    [(value)]="reasonForLoss">
                    <mat-option [value]="reasonForLoss.value" *ngFor="let reasonForLoss of reasonForLosses">
                        {{ reasonForLoss.label }}
                    </mat-option>
                </mat-select>
            </mat-form-field>
        </div>
    </div>
    <div mat-dialog-actions>
        <button mat-button (click)="onOkClick()">Ok</button>
    </div>
    `
  })
  export class ReasonForLossInputDialogComponent {
  
    reasonForLosses = [];
    reasonForLoss = '';

    constructor(
      public dialogRef: MatDialogRef<ReasonForLossInputDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any) { 
          this.reasonForLosses = data.reasonForLosses;
          this.reasonForLoss = this.reasonForLosses[0] && this.reasonForLosses[0].value;
      }
  
    onOkClick(): void {
      this.dialogRef.close(this.reasonForLoss);
    }
  
  }