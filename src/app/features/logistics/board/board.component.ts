import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { groupBy, sumBy } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { SelectionService } from 'app/core/services/selection.service';
import { LogisticsService } from 'app/core/services/logistics.service';
import { Logistic, LogisticStates } from 'app/models/logistics';

@Component({
    selector: 'logistics-scrumboard-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
    animations: fuseAnimations
})
export class FuseScrumboardBoardComponent implements OnInit, OnDestroy {
    @Input() condensed = false;

    statusGroup: any;
    stList = [];
    onBoardChanged: Subscription;
    onStatusChanged: Subscription;
    @ViewChild('board') board: ElementRef;

    checkboxes: any = {};

    constructor(
        private service: LogisticsService,
        public selection: SelectionService
    ) {
        this.onBoardChanged =
            this.service.onLogisticsChanged
                .subscribe(logistics => {
                    this.selection.init(logistics);
                    this.statusGroup = groupBy(logistics, 'status');
                });

        this.stList = LogisticStates;
    }

    ngOnInit() {
        this.service.getBoardLogistics()
            .subscribe(() => { });
    }

    ngOnDestroy() {
        this.onBoardChanged.unsubscribe();
    }

    onListAdd(newListName) {
        if (newListName === '') {
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
