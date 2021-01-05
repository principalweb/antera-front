import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { groupBy } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { SelectionService } from 'app/core/services/selection.service';
import { EcommerceBillingService } from 'app/core/services/billing.service';

@Component({
    selector   : 'billing-scrumboard-board',
    templateUrl: './board.component.html',
    styleUrls  : ['./board.component.scss'],
    animations : fuseAnimations
})
export class FuseScrumboardBoardComponent implements OnInit, OnDestroy
{
    @Input() condensed = false;

    stageGroup: any;
    stList = [];
    onBoardChanged: Subscription;
    onStageChanged: Subscription;
    @ViewChild('board') board: ElementRef;

    checkboxes: any = {};

    constructor(
        private service: EcommerceBillingService,
        public selection: SelectionService
    )
    {
        this.onBoardChanged =
            this.service.onBillingChanged
                .subscribe(billing => {
                    this.selection.init(billing);
                    this.stageGroup = groupBy(billing, 'billingStage');
                    console.log(this.stageGroup);
                });
        
        this.onStageChanged = 
            this.service.onStageChanged
                .subscribe(list => {
                    this.stList = list;
                });
    }

    ngOnInit()
    {
        this.service.getBoardBilling()
            .subscribe(() => {});
    }

    ngOnDestroy()
    {
        this.onBoardChanged.unsubscribe();
        this.onStageChanged.unsubscribe();
    }

    onListAdd(newListName)
    {
        if ( newListName === '' )
        {
            return;
        }

        this.service.addStatus(newListName);
    }

    onSelectCard(ev) {
        this.selection.toggle(ev.card.id);
    }

    onDrop(ev) {
        console.log(ev, this.stList);
    }

}
