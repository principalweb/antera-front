import { Component, Input, Output, ViewEncapsulation, OnInit, EventEmitter } from '@angular/core';
import { find } from 'lodash';
import * as moment from 'moment';
import { priorities, assignees } from '../../../constants';
import { fx2Str } from 'app/utils/utils';

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
    equipment: any = {};
    isOverdue = false;
    fx2Str = fx2Str;
    dueColor: string = '';
    image: string = '';
    orders: string = '';

    constructor(){}

    ngOnInit() {
        this.priority = find(priorities, {value: this.card.priorityName});

        if (this.card.due && this.card.due !== '0000-00-00') {
            let cardDate = moment(this.card.due).endOf('day');
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

        if (this.card.variation) {
            let variation = this.card.variation.find(item => item.design_variation_unique_id = this.card.variationId);
            if (variation.itemImageThumbnail) {
                this.image = variation.itemImageThumbnail.shift();
            }
        }

        if (this.card.batchMaster) {
            this.orders = Array.from(new Set(this.card.batchJobs.map(item => item.orderName))).join();;
        } else {
            //this.orders = this.card.orderName;
            console.log(this.card);
            if(this.card.workOrderNo)
                this.orders = this.card.workOrderNo;
            else 
                this.orders = this.card.orderName;
        }
    }

    onSelect(ev) {
        this.select.emit(ev.checked);
    }

    onPin() {
        this.card.pinned = !this.card.pinned;
        this.pinned.emit(this.card);
    }
}
