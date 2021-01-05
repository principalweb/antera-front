import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { groupBy } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { ProductionsService } from '../../../core/services/productions.service';

@Component({
    selector   : 'fuse-production-scrumboard-board',
    templateUrl: './board.component.html',
    styleUrls  : ['./board.component.scss'],
    animations : fuseAnimations
})
export class FuseScrumboardBoardComponent implements OnInit, OnDestroy
{
    @Input() condensed = true;

    statusGroup: any;
    statusList = [];
    onBoardChanged: Subscription;
    onProductionsChanged: Subscription;
    onStatusListChanged: Subscription;
    @ViewChild('board') board: ElementRef;

    constructor(
        private productionsService: ProductionsService
    )
    {
        this.onProductionsChanged =
            this.productionsService.onProductionsChanged
                .subscribe((productions: any) => {
                    this.productionsService.selection.init(productions);
                    this.statusGroup = groupBy(productions, 'statusId');
                    console.log("statusGroup", this.statusGroup);
                });

        this.onStatusListChanged =
            this.productionsService.onStatusListChanged
                .subscribe(list => {
                    this.statusList = list;
                });
    }

    ngOnInit()
    {
        this.productionsService.getProductions()
            .subscribe(() => {
            });
    }

    ngOnDestroy()
    {
        this.onProductionsChanged.unsubscribe();
        this.onStatusListChanged.unsubscribe();
    }

    onListAdd(newListName)
    {
        if ( newListName === '' )
        {
            return;
        }

        this.productionsService.addStatus(newListName);
    }

    onDrop(ev) {
        this.productionsService.selection.reset(false);
    }

    onSelectCard(ev) {
        this.productionsService.selection.toggle(ev.card.id);
    }

}
