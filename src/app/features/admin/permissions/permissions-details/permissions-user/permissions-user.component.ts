import { Component, OnInit, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { PermissionService } from 'app/core/services/permission.service';
import { MessageService } from 'app/core/services/message.service';
import { fuseAnimations } from '@fuse/animations';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component'
import { map } from 'rxjs/operators';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-permissions-user',
  templateUrl: './permissions-user.component.html',
  styleUrls: ['./permissions-user.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class PermissionsUserComponent implements OnInit {

    @Input() users;
    @Input() groupId;

    displayedColumns = ['name', 'remove'];
        
    constructor(
        private permService: PermissionService,
        private msgService: MessageService,
        public dialog: MatDialog
    ) { }

    ngOnInit() {
    }

    addUser() {
        const dialogRef = this.dialog.open(AddUserDialogComponent, {
            width: '300px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (typeof result !== 'undefined') {
                this.permService.addUserToGroup({groupId: this.groupId, userId: result.id}).subscribe(
                    (res:any) => {
                        this.msgService.show('User added!', 'success');
                    },
                    (err:any) => {
                        this.msgService.show('Error adding user to group. They are likely already a member.', 'error')
                    }
                )
            }
        });

    }

    removeUser(userName, userId) {
        if(confirm("Are you sure you want to remove " + userName + " from this group?")) {
            this.permService.delUserFromGroup({userId: userId, groupId: this.groupId}).subscribe((res: any) => {
                this.msgService.show('User deleted!', 'info');
            });
        }
    }

    trackById(index, item) {
        return item.id;
    }
}
