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

        return this.card.name + '\n' +
               'Type: ' + this.card.logisticType + '\n' +
               'Business Type: ' + this.card.businessType + '\n' +
               'Sales Stage: ' + this.card.salesStage + '\n' +
               'Event Date: ' + this.card.eventDate + '\n' +
               'Account: ' + this.card.accountName + '\n' +
               'Contact: ' + this.card.contactName + '\n' +
               'Number: ' + this.card.logisticNo;
    }

    onSelect(ev) {
        this.select.emit(ev.checked);
    }
}
