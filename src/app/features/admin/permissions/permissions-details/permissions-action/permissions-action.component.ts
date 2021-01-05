import { Component, Input, ViewEncapsulation } from '@angular/core';
import { PermissionService } from 'app/core/services/permission.service';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { PermissionAction } from 'app/models/permission-action';


@Component({
    selector: 'app-permissions-action',
    templateUrl: './permissions-action.component.html',
    styleUrls: ['./permissions-action.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PermissionsActionComponent {

    @Input() actions: PermissionAction[];
    @Input() groupId;

    displayedColumns = ['label', 'allowAction'];

    constructor(
        private permService: PermissionService,
        private msgService: MessageService
    ) { }

    save() {
        this.permService.setGroupActionValues({groupId: this.groupId, actions: this.actions})
            .subscribe((res: any) => {
                if (res.status == 'success') {
                    this.msgService.show('Permissions updated!', 'info');
                } else {
                    this.msgService.show('Unable to update permissions: ' + res.msg, 'error');
                }
            })
    }

    trackById(index, item) {
        return item.id;
    }

}
