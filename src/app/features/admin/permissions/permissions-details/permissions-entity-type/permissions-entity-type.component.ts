import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { PermissionService } from 'app/core/services/permission.service';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-permissions-entity-type',
  templateUrl: './permissions-entity-type.component.html',
  styleUrls: ['./permissions-entity-type.component.scss'],
  animations   : fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class PermissionsEntityTypeComponent implements OnInit {

    @Input() entityTypes;
    @Input() groupId;

    displayedColumns = ['name', 'allowView', 'allowEdit', 'allowPermission', 'allowDelete', 'unrestricted'];

    constructor(
        private permService: PermissionService,
        private msgService: MessageService
    ) { }

    ngOnInit() {
    }

    save() {
        this.permService.setGroupEntityTypeValues({groupId: this.groupId, entityTypes: this.entityTypes}).subscribe((res:any) => {
            this.msgService.show('Permissions updated!', 'info');
        });
    }

    trackById(index, item) {
        return item.id;
    }
}
