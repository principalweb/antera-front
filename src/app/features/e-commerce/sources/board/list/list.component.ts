import { Component, Input, ViewEncapsulation, EventEmitter, Output, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { SourcesService } from 'app/core/services/sources.service';
import { Router } from '@angular/router';
import { SourceDetails } from 'app/models/source';
import { switchMap } from 'rxjs/operators';

@Component({
    selector     : 'fuse-scrumboard-board-list',
    templateUrl  : './list.component.html',
    styleUrls    : ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseScrumboardBoardListComponent implements OnInit
{
    dialogRef: any;

    @Input() condensed = true;
    @Input() list = [];
    @Input() status;

    @Output() dragStart = new EventEmitter();
    @Output() selectCard = new EventEmitter();
    
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    constructor(
        public dialog: MatDialog,
        private service: SourcesService,
        private router: Router,
    )
    {
    }

    ngOnInit() {
    }

    removeList()
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete the list and it\'s all cards?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                if (this.list) {
                    this.list.forEach(card => {
                        // this.service.deleteSource(card);
                    });
                }
                this.service.removeStatus(this.status);
            }
        });
    }

    deleteSource(source)
    {
        this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            disableClose: false
        });

        this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to delete this Source?';

        this.confirmDialogRef.afterClosed().subscribe(result => {
            if ( result )
            {
                this.service.deleteSources([source.id])
                    .subscribe(() => {})
            }
            this.confirmDialogRef = null;
        });
    }

    editSource(source)
    {
        this.router.navigate(['/e-commerce/sources', source.id]);
    }

    onDrop(ev)
    {
        const source = ev.value;
        this.service.getSource(source.id).pipe(
            switchMap((source: any) => {
                source.status = this.status.value;
                return this.service.updateSource(new SourceDetails(source));
            })
        ).subscribe(() => {});
    }

    onListNameChanged(ev)
    {
        
    }

    onSelectCard(card, selected) {
        this.selectCard.emit({card, selected});
    }

    tooltip(card) {
        if (this.condensed) {
            let text  = '';
            text += card.name + '\n';

            return text;
        }
        return null;
    }

    total(list){
        if (!list)
            return 0;
        let t = 0;
        list.forEach(card => {
            t += parseFloat(card.itemNumber);
        });
        return t;
    }
}
