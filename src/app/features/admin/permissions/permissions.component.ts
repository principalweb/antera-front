import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { PermissionService } from 'app/core/services/permission.service';
import { MessageService } from 'app/core/services/message.service';
import { AddGroupDialogComponent } from './add-group-dialog/add-group-dialog.component'

@Component({
    selector: 'app-permissions',
    templateUrl: './permissions.component.html',
    styleUrls: ['./permissions.component.scss'],
    animations: fuseAnimations,
    providers: [PermissionService]
})
export class PermissionsComponent implements OnInit {

    enabled: boolean;

    constructor(
        private permService: PermissionService,
        private msgService: MessageService,
        private router: Router,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
        this.permService.getPermissionStatus().subscribe((res: any) => {
            if (res == '0' || res == 0 || res == false) {
                res = false
            } else {
                res = true;
            }
            this.enabled = res;
        });
    }

    createGroup(): void {
        const dialogRef = this.dialog.open(AddGroupDialogComponent, {
            width: '300px'
        });

        dialogRef.afterClosed().subscribe(result => {
            this.permService.createGroup({name: result}).subscribe(
                (res:any) => {
                    this.router.navigate(['/admin/permissions', res.data.id]);
                },
                (err:any) => {
                    this.msgService.show('Error creating group. It probably already exists.', 'error');
                    this.router.navigate(['/admin/permissions']);
                }
            )
        });
    }

    toggleStatus(): void {
        this.permService.setPermissionStatus(!this.enabled).subscribe((res: any) => {
            if (res == '0' || res == 0 || res == false) {
                res = false
            } else {
                res = true;
            }

            this.enabled = res;
        });
    }
}
