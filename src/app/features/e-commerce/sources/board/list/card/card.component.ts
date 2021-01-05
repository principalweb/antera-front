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

        return this.card.itemName + '\n' +
               'Name: ' + this.card.gcName + '\n' +
               'Item Number: ' + this.card.gcItemNumber + '\n' +
               'Quote Valid Through: ' + this.card.quoteValidThrough + '\n' +
               'Created By: ' + this.card.createdByName + '\n' +
               'Assign To: ' + this.card.assignedSalesRep + '\n' +
               'Date Created: ' + this.card.dateEntered;
    }

    onSelect(ev) {
        this.select.emit(ev.checked);
    }
}
