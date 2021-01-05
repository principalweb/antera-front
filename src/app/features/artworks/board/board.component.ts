import { Component, OnDestroy, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { groupBy } from 'lodash';

import { fuseAnimations } from '@fuse/animations';

import { ArtworksService } from '../../../core/services/artworks.service';

@Component({
    selector   : 'fuse-artwork-scrumboard-board',
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
    onArtworksChanged: Subscription;
    onStatusListChanged: Subscription;
    @ViewChild('board') board: ElementRef;

    constructor(
        private artworksService: ArtworksService,
        private cd: ChangeDetectorRef,
    )
    {
    }

    ngOnInit()
    {
        this.onStatusListChanged =
            this.artworksService.onStatusListChanged
                .subscribe(list => {
                    this.statusList = list;
                    this.cd.markForCheck();
                });

        this.onArtworksChanged =
            this.artworksService.onArtworksChanged
                .subscribe(artworks => {
                    this.statusGroup = groupBy(artworks, 'statusId');
                    this.cd.markForCheck();
                });

        this.artworksService.getStatusList().subscribe(() => {
            this.artworksService.getArtworks().subscribe(() => {})
        });
    }

    ngOnDestroy()
    {
        this.onArtworksChanged.unsubscribe();
        this.onStatusListChanged.unsubscribe();
    }

    onListAdd(newListName)
    {
        if ( newListName === '' )
        {
            return;
        }

        this.artworksService.addStatus(newListName);
    }

    onDrop(ev) {
    }
}
