import { Component, OnInit, Input } from '@angular/core';
import { PermissionService } from 'app/core/services/permission.service';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'permissions-options-list',
  templateUrl: './permissions-options-list.component.html',
  styleUrls: ['./permissions-options-list.component.css']
})
export class PermissionsOptionsListComponent implements OnInit {

    @Input() options: any[];

    columns = [
        'label',
        'enabled'
    ];

    constructor(
        private permService: PermissionService,
        private msg: MessageService
    ) { }

    ngOnInit() {
    }

    updateEnabled(id, ev) {
        this.permService.updateEntityTypeOptionEnabled(id, ev.checked).subscribe(
        (res: any) => {
            this.msg.show('Permission modules updated!', 'success');
        },
        (err: any) => {
            this.msg.show('Unable to update permission modules at this time.', 'error');
        });
    }

}
