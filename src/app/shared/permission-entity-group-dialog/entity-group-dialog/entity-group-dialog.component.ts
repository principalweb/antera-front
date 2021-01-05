import { Component, OnInit, ViewEncapsulation, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PermissionService } from 'app/core/services/permission.service';
import { PermissionEntityGroup } from 'app/models/permission-entity-group';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-entity-group-dialog',
    templateUrl: './entity-group-dialog.component.html',
    styleUrls: ['./entity-group-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class EntityGroupDialogComponent implements OnInit, OnDestroy {

    currentGroups: PermissionEntityGroup[];
    otherGroups: PermissionEntityGroup[];

    onEntityGroupChangedSubscription: Subscription;
    onOtherEntityGroupChangedSubscription: Subscription;

    constructor(
        public dialogRef: MatDialogRef<EntityGroupDialogComponent>,
        private permService: PermissionService,
        @Inject(MAT_DIALOG_DATA) private data: any
    ) { }

    ngOnInit() {

        this.onEntityGroupChangedSubscription = this.permService.onEntityGroupChanged.subscribe((res:PermissionEntityGroup[]) => {
            this.currentGroups = res;
        });

        this.onOtherEntityGroupChangedSubscription = this.permService.onOtherEntityGroupChanged.subscribe((res:PermissionEntityGroup[]) => {
            this.otherGroups = res;
        });

        this.permService.getEntityGroups(this.data.entityId, this.data.entityType).subscribe();
    }

    cancelClick(): void {
        this.dialogRef.close();
    }

    add(id) {
        this.permService.addEntityGroup({entityId: this.data.entityId, entityType: this.data.entityType, groupId: id})
            .subscribe((res: any) => {
                this.permService.getEntityGroups(this.data.entityId, this.data.entityType).subscribe();
            });
    }

    remove(id) {
        this.permService.removeEntityGroup({entityId: this.data.entityId, entityType: this.data.entityType, groupId: id})
            .subscribe((res: any) => {
                this.permService.getEntityGroups(this.data.entityId, this.data.entityType).subscribe();
            });
    }

    ngOnDestroy() {
        this.onEntityGroupChangedSubscription.unsubscribe();
        this.onOtherEntityGroupChangedSubscription.unsubscribe();
    }
}
