import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { groupBy } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { SelectionService } from 'app/core/services/selection.service';
import { SourcesService } from 'app/core/services/sources.service';

@Component({
    selector   : 'sources-scrumboard-board',
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
        private service: SourcesService,
        public selection: SelectionService
    )
    {
        this.onBoardChanged =
            this.service.onSourcesChanged
                .subscribe(sources => {
                    this.selection.init(sources);
                    this.statusGroup = groupBy(sources, 'status');
                });
        
        this.onStatusChanged = 
            this.service.onStatusesChanged
                .subscribe(list => {
                    this.stList = list;
                });
    }

    ngOnInit()
    {
        this.service.getBoardSources()
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
        console.log(ev, this.stList);
    }

}
