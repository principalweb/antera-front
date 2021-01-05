import { Component, OnInit, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PermissionService } from 'app/core/services/permission.service';
import { EntityGroupDialogComponent } from './entity-group-dialog/entity-group-dialog.component';

@Component({
    selector: 'permission-entity-group-dialog',
    templateUrl: './permission-entity-group-dialog.component.html',
    styleUrls: ['./permission-entity-group-dialog.component.scss']
})
export class PermissionEntityGroupDialogComponent implements OnInit {

    @Input() entityId;
    @Input() entityType;

    constructor(
        private permService: PermissionService,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
    }

    addToGroup(): void {
        const dialogRef = this.dialog.open(EntityGroupDialogComponent, {
            width: '800px',
            data: {entityId: this.entityId, entityType: this.entityType}
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
        });
    }
}
