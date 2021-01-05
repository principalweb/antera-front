import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ActivatedRoute } from '@angular/router';
import { PermissionGroup } from 'app/models';
import { Subscription } from 'rxjs';
import { PermissionService } from 'app/core/services/permission.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-permissions-details',
  templateUrl: './permissions-details.component.html',
  styleUrls: ['./permissions-details.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None

})
export class PermissionsDetailsComponent implements OnInit, OnDestroy {
    action: string;
    details: PermissionGroup;
    routeChanged: Subscription;
    onGroupChangedSubscription: Subscription;
    tab: string;

    constructor(
        private route: ActivatedRoute,
        private permService: PermissionService,
        private msgService: MessageService
    ) { }

    ngOnInit() {

        this.onGroupChangedSubscription = this.permService.onGroupChanged.subscribe(res => {
            this.details = res;
        });

        this.routeChanged = this.route.data.subscribe(({data}) => {
            this.action = data[0];
            this.details = data[1];
        });

        this.tab = null;
    }

    ngOnDestroy() {
        this.onGroupChangedSubscription.unsubscribe();
        this.routeChanged.unsubscribe();
    }

    chTab(ev) {
        console.log(ev);
    }

    setActiveStatus() {
        this.permService.setGroupActiveStatus({status: !this.details.status, id: this.details.id}).subscribe((res: any) => {
        });
    }
}
