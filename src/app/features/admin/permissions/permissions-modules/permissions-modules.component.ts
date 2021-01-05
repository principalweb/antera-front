import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { PermissionService } from 'app/core/services/permission.service';
import { MessageService } from 'app/core/services/message.service';
import { PermissionEntityType } from 'app/models/permission-entity-type'


@Component({
    selector: 'app-permissions-modules',
    templateUrl: './permissions-modules.component.html',
    styleUrls: ['./permissions-modules.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None

})
export class PermissionsModulesComponent implements OnInit {

    modules: PermissionEntityType[];
    columns = [
        'name',
        'enabled'
    ];

    constructor(
        private permService: PermissionService,
        private msg: MessageService,
        private router: Router
    ) {
    }

    ngOnInit() {
        this.permService.getEntityTypes().subscribe((res: PermissionEntityType[]) => {
            this.modules = res;
        });
    }

    updateEnabled(id, ev) {
        this.permService.updateEntityTypeEnabled(id, ev.checked).subscribe(
        (res: any) => {
            this.msg.show('Permission modules updated', 'success');
        },
        (err: any) => {
            this.msg.show('Unable to update permission modules at this time', 'error');
        });
    }

    editOption(id) {

        this.router.navigate(['/admin/permissions-module-options', id]);
    }
}
