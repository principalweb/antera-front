import { Component, Input, ViewEncapsulation, EventEmitter, Output, OnInit, OnDestroy, AfterViewInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { OpportunityFormDialogComponent } from '../../opportunity-form/opportunity-form.component';
import { OpportunityDetails } from '../../../../models';
import { OpportunitiesService } from 'app/core/services/opportunities.service';
import { ApiService } from 'app/core/services/api.service';
import { find } from 'lodash';
import { switchMap } from 'rxjs/operators';
import { ActivatedRoute } from "@angular/router";

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

    private editID = null;

    constructor(
        public dialog: MatDialog,
        private service: OpportunitiesService,
        private api: ApiService,
        private activatedRoute: ActivatedRoute
    )
    {
    }

    ngOnInit() {
        this.editID = this.activatedRoute.snapshot.paramMap.get('id');
        if (this.editID != null) {
            this.editOpportunity({ id: this.editID });
        }
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
                        // this.service.deleteOpportunity(card);
                    });
                }
                this.service.removeStatus(this.stage);
            }
        });
    }

    deleteOpportunity(opportunity)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this opportunity?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.service.deleteOpportunities([opportunity.id])
                    .subscribe(() => {})
            }
            this.confirmDialogRef = null;
        });
    }

    editOpportunity(opportunity)
    {
        this.service.getOpportunity(opportunity.id)
            .subscribe((data) => {
                const opportunity1 = new OpportunityDetails(data);
                if (this.dialog.openDialogs.length == 0) {
                    this.dialogRef = this.dialog.open(OpportunityFormDialogComponent, {
                        panelClass: 'opportunity-form-dialog',
                        data: {
                            opportunity: opportunity1,
                            action: 'edit',
                            service: this.service
                        }
                    });

                    this.dialogRef.afterClosed()
                        .subscribe(response => {
                            if (!response) {
                                return;
                            }

                            switch (response[0]) {
                                case 'save':
                                    this.service.updateOpportunity(response[1])
                                        .subscribe(() => { });
                                    break;

                                case 'delete':
                                    this.deleteOpportunity(opportunity1);
                                    break;
                            }
                        });
                }
            });
    }

    onDrop(ev)
    {
        const opportunity = ev.value;
        if (this.stage.stageKey == 'ClosedLost'){
            this.api.getDropdownOptions({dropdown:['sys_reasons_for_loss_list']})
            .subscribe((res: any[]) => {
                const reasonLossDropdown = find(res, {name: 'sys_reasons_for_loss_list'});
                const reasonForLosses = reasonLossDropdown.options;
                let dialogRef = this.dialog.open(ReasonForLossInputDialogComponent, {
                    width: '400px',
                    data: { reasonForLosses: reasonForLosses }
                });
                dialogRef.afterClosed().subscribe(result => {
                    if (!result) {
                      return;
                    }
                    this.service.getOpportunity(opportunity.id).pipe(
                        switchMap((opp: any) => {
                            opp.salesStage = this.stage.stageKey;
                            opp.probability = this.stage.probability;
                            opp.reasonsForLoss = result;
                            return this.service.updateOpportunity(opp);
                        }),
                    ).subscribe(() => {});
                });
            });
        }
        else {
            this.service.getOpportunity(opportunity.id).pipe(
                switchMap((opp: any) => {
                    opp.salesStage = this.stage.stageKey;
                    opp.probability = this.stage.probability;
                    return this.service.updateOpportunity(opp);
                }),
            ).subscribe(() => {});
        }
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
