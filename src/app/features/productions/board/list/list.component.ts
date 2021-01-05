import { Component, Input, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { PauseDialogComponent } from '../../productions/pause-dialog/pause-dialog.component';
import { ApiService } from 'app/core/services/api.service';
import { ProductionsService } from '../../../../core/services/productions.service';
import { MessageService } from '../../../../core/services/message.service';
import { fx2Str } from 'app/utils/utils';

@Component({
    selector     : 'fuse-scrumboard-board-list',
    templateUrl  : './list.component.html',
    styleUrls    : ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseScrumboardBoardListComponent
{
    dialogRef: any;

    @Input() condensed = true;
    @Input() list;
    @Input() status;
    @Output() dragStart = new EventEmitter();
    @Output() selectCard = new EventEmitter();

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    pauseDialogRef: MatDialogRef<PauseDialogComponent>;
    allowNoEquipment: boolean = false;

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private api: ApiService,
        private productionsService: ProductionsService,
        private msgService: MessageService
    ) 
    { 
        this.api.getAdvanceSystemConfig({module: 'Production', setting:'allowNoEquipment'})
        .subscribe((response:any) => {
            if(response.value && response.value == 1) {
                this.allowNoEquipment = true;
            }
        });
    }

    removeList()
    {
        if (this.list && this.list.length > 0) {
            this.msgService.show('You cannot delete list with orders', 'error');
            return;
        }

        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete the list and it\'s all cards?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.productionsService.removeStatus(this.status.id);
            }
        });
    }

    deleteProduction(production)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.productionsService.deleteProduction(production);
            }

            this.confirmDialogRef = null;
        });

    }
    isSelected(){
        return this.status.id == this.productionsService.barCodeStation.value
    }

    editProduction(production)
    {
        this.router.navigate(['/productions', production.id]);
    }

    onDrop(ev)
    {
        const production = ev.value;
        // no action if the drag and drop is the same column
        if (production.statusId == this.status.id) {
            return;
        }
        if (this.status.name == 'Done' && production.batchMaster == 1) {
            if (!confirm("Moving a batch job to " + this.status.label + " status will remove the master batch job, and all associated jobs will be set to " + this.status.label + " status. Do you wish to continue?")) {
                this.productionsService.getProductions().subscribe();
                return;
            }
        }
        if(this.allowNoEquipment) {
            // NOT SURE YET IF THIS WILL BREAK ANY EXISTING LOGIC. PROBABLY HIT THE TIME CALCULATION
        } else {
            if (this.status.name == 'Scheduled' && (production.machineId == 0 || production.machineName == '')) {
                alert("A job cannot be scheduled unless a machine has been assigned. You are being redirected to this job's details to assign a machine.");
                this.router.navigate(['/productions', production.id]);
                //this.productionsService.getProductions().subscribe();
                return;
            }
        }

        production.statusId = this.status.id;
        production.statusName = this.status.name;

        if (this.status.name == 'Paused') { 
            this.pauseDialogRef = this.dialog.open(PauseDialogComponent, {
                disableClose: true
            });

            this.pauseDialogRef.afterClosed().subscribe(res => {
                if (res) {
                    let reasonId = res.id;
                    this.productionsService.updateJobStatus(production.id, this.status.id, production.machineId, reasonId).subscribe();
                }
            });
        } else {
            this.productionsService.updateJobStatus(production.id, this.status.id, production.machineId).subscribe();
        }
    }

    onListNameChanged(ev)
    {
        this.productionsService.updateStatus(ev);
    }


    tooltip(card) {
        let text  = '';
        text += card.customerName + (card.orderName ? ': ' + card.orderName : '') + '\n';
        text += 'Due Date: ' + card.due + '\n';
        text += 'Product: ' + card.productName + ' | ' + 'Size: ' + card.size + ' | ' + 'Color: ' + card.color + '\n';
        text += 'Machine : ' + card.machineName + '\n';
        text += 'Customer Name: ' + card.customerName + '\n';
        if(card.workOrderNo) {
            text += (card.workOrderNo ? 'WorkOrder #: ' + card.workOrderNo + '\n' : '');
        } else {
            text += (card.orderName ? 'Order #: ' + card.orderName + '\n' : '');
        }
        text += 'Deco Type: ' + card.decoTypeName + '\n';
        text += 'Design Variation: ' + card.variationName + '\n';
        text += 'Quantity: ' + card.qty + '\n';
        text += 'Production #: ' + card.id + '\n';
        //text += 'Notes: ' + card.description + '\n'; // Too Long

        return text;
    }

    get total(){
        if (!this.list) {
            return fx2Str(0);
        }

        let t = 0.00;
        this.list.forEach(card => {
            t += card.hours;
        });

        return fx2Str(t);
    }

    onSelectCard(card, selected) {
        this.selectCard.emit({card, selected});
    }

    onPinCard(card) {
        this.productionsService.setPinned(card).subscribe((res: any) => {
            this.productionsService.getProductions().subscribe();
        });
    }
}
