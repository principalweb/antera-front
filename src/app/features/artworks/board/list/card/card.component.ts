import { Component, Input, Output, ViewEncapsulation, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { find } from 'lodash';
import * as moment from 'moment';
import { priorities, assignees } from '../../../constants';
import { fx2Str } from 'app/utils/utils';
import { OrderDetailDialogComponent } from 'app/shared/order-detail-dialog/order-detail-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SelectionService } from 'app/core/services/selection.service';
import { Subscription } from 'rxjs';
import { ArtworksService } from 'app/core/services/artworks.service';

@Component({
    selector     : 'fuse-scrumboard-board-card',
    templateUrl  : './card.component.html',
    styleUrls    : ['./card.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseScrumboardBoardCardComponent implements OnInit
{
    @Input() card: any;
    @Input() condensed = true;
    @Output() select = new EventEmitter();
    @Output() pinned = new EventEmitter();
    priority: any = {};
    assignee: any = {};
    isOverdue = false;
    dueColor: string = '';
    orderDetailDlgRef: MatDialogRef<OrderDetailDialogComponent>;
    onSelectionChangedSubscription: Subscription;
    ttCustomer = "Customer";
    ttOrderNo = "Order #";
    fx2Str = fx2Str;
    checkboxes: any = {};
    onArtworksChangedSubscription: Subscription;
  constructor(
    private dialog: MatDialog,
    private artworksService: ArtworksService,
    public selection: SelectionService,
    private cd: ChangeDetectorRef
  ) {
    this.onArtworksChangedSubscription =
    this.artworksService.onArtworksChanged.subscribe(artworks => {
        this.selection.init(artworks);
    });
    this.onSelectionChangedSubscription =
    this.selection.onSelectionChanged.subscribe(selection => {
      this.checkboxes = selection;
        
    });
  }
    ngOnInit() {
        this.priority = find(priorities, {value: this.card.priority});
        this.assignee = find(assignees, {name: this.card.assignee});

        this.isOverdue = (this.card.dueDate !== null) && (moment() > moment(new Date(this.card.dueDate)));

        if (this.condensed) {
            this.ttCustomer = '';
            this.ttOrderNo = '';
        }
        if (this.card.dueDate && this.card.dueDate !== '0000-00-00') {
            let cardDate = moment(this.card.dueDate).endOf('day');
            let curDate = moment().endOf('day');
            let diff = cardDate.diff(curDate, 'hours');
            switch(true) {
                // red past due or due today
                case diff < 24:
                    this.dueColor = 'red';
                break;
                // tomorrow
                case diff >= 24 && diff < 24*2:
                    this.dueColor = '#fee12b';
                break;
                // this week
                case diff >= 24*2 && diff <= 24*7:
                    this.dueColor = 'green';
                break;
                default:
                    this.dueColor = '';
                    break;
                    
            }
        }

    }

    onPin(ev) {
        ev.stopPropagation();
        this.card.pinned = !this.card.pinned;
        this.pinned.emit(this.card);
    }

  openRelatedOrderDetailDialog(orderId) {
    this.orderDetailDlgRef = this.dialog.open(OrderDetailDialogComponent, {
      panelClass: 'antera-details-dialog',
      data: {
        orderId: orderId,
        designId: this.card.designId,
        showBasicOrderDetails: true,
        showBillingShippingDetails: true,
        showProducts: true,
      }
    });
  }

  onSelect(card) {
    // console.log("this.select",this.select);
    // this.select.emit(ev.checked);
    console.log("this.selection",this.selection.selectedIds)
    this.selection.toggle(card.id);
  }

}
