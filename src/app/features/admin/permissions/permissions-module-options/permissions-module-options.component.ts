import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { PermissionService } from 'app/core/services/permission.service';
import { MessageService } from 'app/core/services/message.service';

import { PermissionEntityType } from 'app/models/permission-entity-type';


@Component({
    selector: 'permissions-module-options',
    templateUrl: './permissions-module-options.component.html',
    styleUrls: ['./permissions-module-options.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None

})
export class PermissionsModuleOptionsComponent implements OnInit {

    routeChanged: Subscription;
    entityType: PermissionEntityType;

    constructor(
        private route: ActivatedRoute,
        private permService: PermissionService,
        private msg: MessageService
    ) { }

    ngOnInit() {
        this.routeChanged = this.route.data.subscribe(({data}) => {
            this.entityType = (data);
            console.log(this.entityType);
        });
    }

    ngOnDestroy() {
        this.routeChanged.unsubscribe();
    }

    updateEnabled(entityType) {
        this.permService.updateEntityTypeEnabled(entityType.id, !entityType.enabled).subscribe(
        (res: any) => {
            this.entityType.enabled = res.data.enabled
            this.msg.show('Permission modules updated!', 'success');
        },
        (err: any) => {
            this.msg.show('Unable to update permission modules at this time.', 'error');
        });

    }
}
