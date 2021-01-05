import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { groupBy, sumBy } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { SelectionService } from 'app/core/services/selection.service';
import { OpportunitiesService } from 'app/core/services/opportunities.service';

@Component({
    selector   : 'opportunities-scrumboard-board',
    templateUrl: './board.component.html',
    styleUrls  : ['./board.component.scss'],
    animations : fuseAnimations
})
export class FuseScrumboardBoardComponent implements OnInit, OnDestroy
{
    @Input() condensed = false;

    statusGroup: any;
    stList = [];
    onBoardChanged: Subscription;
    onStatusChanged: Subscription;
    @ViewChild('board') board: ElementRef;

    checkboxes: any = {};

    constructor(
        private service: OpportunitiesService,
        public selection: SelectionService
    )
    {
        this.onBoardChanged =
            this.service.onOpportunitiesChanged
                .subscribe(opportunities => {
                    this.selection.init(opportunities);
                    this.statusGroup = groupBy(opportunities, 'salesStage');
                });
        
        this.onStatusChanged = 
            this.service.onStagesChanged
                .subscribe(list => {
                    this.stList = list;
                });
    }

    ngOnInit()
    {
        this.service.getBoardOpportunities()
            .subscribe(() => {});
    }

    ngOnDestroy()
    {
        this.onBoardChanged.unsubscribe();
        this.onStatusChanged.unsubscribe();
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
    }

}
