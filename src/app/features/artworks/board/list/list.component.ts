import { Component, Input, ViewEncapsulation, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ActivitiesService } from 'app/core/services/activities.service';
import { ActivityFormDialogComponent } from 'app/shared/activity-form/activity-form.component';
import { ArtistDialogComponent } from './artist-dialog/artist-dialog.component';
import { ArtworksService } from '../../../../core/services/artworks.service';
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
   // dialogRef: any;

    @Input() condensed = true;
    @Input() list;
    @Input() status;
    @Output() dragStart = new EventEmitter();

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<ArtistDialogComponent>;
    activityDialogRef: MatDialogRef<ActivityFormDialogComponent>;

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private artworksService: ArtworksService,
        private actvitiyService: ActivitiesService,
        private msgService: MessageService,
        private cd: ChangeDetectorRef,
    ) { }

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
                this.artworksService.removeStatus(this.status.id);
            }
        });
    }

    deleteArtwork(artwork)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result ) {
                this.artworksService.deleteArtwork(artwork);
            }

            this.confirmDialogRef = null;
        });

    }

    docArtProof(artwork)
    {
      let queryParams = {};
      queryParams = { docType: 'art'};
      this.router.navigate(['/e-commerce/orders', artwork.orderId],{queryParams});
    }


    editArtwork(artwork)
    {
        this.router.navigate(['/artworks', artwork.id]);
    }

    taskActivity(type = 'Task', order){
        this.activityDialogRef = this.dialog.open(ActivityFormDialogComponent, {
          panelClass: 'activity-form-dialog',
          data      : {
              action: 'new',
              type : type,
              order: order,
              service : this.actvitiyService
          }
        });
    }

    assignArtist(dialogTitle, artwork, artist = 'both') 
    {
      this.dialogRef = this.dialog.open(ArtistDialogComponent, {
          panelClass: 'antera-details-dialog',
          width: '50%',
          data      : {
            dialogTitle: dialogTitle,
            artwork: artwork,
            artist: artist
          }
      });

      this.dialogRef.afterClosed()
          .subscribe((data) => {
      });

    }

    onDrop(ev)
    {
        const artwork = ev.value;
        if (artwork.statusId === this.status.id) {
          return;
        }
        artwork.statusId = this.status.id;
        artwork.statusName = this.status.name;
        let orderInfo = {};
        switch (this.status.name) {
          case 'Assigned':
            if(artwork.assignee === '' && artwork.estimated === 0) {
              this.assignArtist('Assign Artist and Estimate', artwork, 'both');
            } if (artwork.assignee !== '' && artwork.estimated === 0) {
              this.assignArtist('Estimate', artwork, 'estimed');
            } else if (artwork.assignee === '' && artwork.estimated !== 0) {
              this.assignArtist('Assign Artist', artwork, 'artist');
            } else {
              this.artworksService.updateArtwork(artwork)
                .subscribe(() => {})
            }
            break;
          case 'Distributor Approval':
            if (artwork.orderId !== '') {
               this.artworksService.updateArtwork(artwork)
                .subscribe(() => {});
                orderInfo = {id : artwork.orderId, orderNo: artwork.orderNum , subject: 'Approval for Artwork'};
                this.taskActivity('Task',orderInfo);
            } else {
              this.artworksService.updateArtwork(artwork)
                .subscribe(() => {})
            }
            break;
          case 'Customer Approval':
             if (artwork.orderId !== '') {
               this.artworksService.updateArtwork(artwork)
                .subscribe(() => {})
               this.docArtProof(artwork);
            } else {
              this.artworksService.updateArtwork(artwork)
                .subscribe(() => {})
            }
            break;
          default:
            this.artworksService.updateArtwork(artwork)
              .subscribe(() => {})
            break;
        }
    }

    onListNameChanged(ev)
    {
        this.artworksService.updateStatus(ev);
    }


    tooltip(card) {
        if (this.condensed) {
            let text  = '';
            text += card.identity + '\n';
            text += 'Due Date: ' + card.dueDate + '\n';
            text += 'Assignee: ' + card.assignee + '\n';
            text += 'Customer Name: ' + card.customerName + '\n';
            if (card.relatedOrders && card.relatedOrders.length > 0){
                text += 'Order# : ';
                card.relatedOrders.forEach((order) => {
                    text +=  order.orderNum + ', ';
                });
                text += '\n';
            }else{
                text += 'Order #: ' + card.orderNum + '\n';
            }
            text += 'Deco Type: ' + card.designTypeName + '\n';
            text += 'Artwork #: ' + card.designNo + '\n';
            text += 'Notes: ' + card.notes + '\n';

                

            //if (card.orderIdentity && card.orderIdentity != '')
            //    text += 'Order Identity: ' + card.orderIdentity + '\n';
            return text;
        }
        return null;
    }

    get total(){
        if (!this.list)
            return 0;

        let t = 0;
        this.list.forEach(card => {
            t += card.estimated;
        });

        return fx2Str(t);
    }

    onPinCard(card, ev) {
        this.artworksService.setPinned(card).subscribe((res: any) => {
            this.artworksService.getArtworks().subscribe();
        })
    }
}
