import { Component, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';


@Component({
    selector     : 'fuse-scrumboard-board-card',
    templateUrl  : './card.component.html',
    styleUrls    : ['./card.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseScrumboardBoardCardComponent
{
    @Input() card: any;
    @Input() condensed = false;
    @Output() select = new EventEmitter();

    get tooltip() {
        if (!this.card) return '';

        return 'Order #: ' + this.card.orderNo + '\n' +
               'Identity: ' + this.card.orderIdentity + '\n' +
               'contact Name: ' + this.card.contactName + '\n' +
               'Account Name: ' + this.card.accountName + '\n' +
               'Order Date: ' + this.card.orderDate + '\n' +
               'Assign To: ' + this.card.salesPerson + '\n' +
               'Payment Status: ' + this.card.paymentStatus + '\n' +
               'In Hand Date: ' + this.card.inHandByDate;
    }

    onSelect(ev) {
        this.select.emit(ev.checked);
    }
}
