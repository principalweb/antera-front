import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PermissionService } from 'app/core/services/permission.service';
//import { PermissionGroupList } from 'app/models/permission-group';
import { DataSource } from '@angular/cdk/collections';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { Router } from '@angular/router';
import { EditGroupNameDialogComponent } from './edit-group-name-dialog/edit-group-name-dialog.component';
import { MessageService } from 'app/core/services/message.service';

@Component({
  selector: 'app-permissions-list',
  templateUrl: './permissions-list.component.html',
  styleUrls: ['./permissions-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class PermissionsListComponent implements OnInit {

    displayedColumns: any;
    filterForm: FormGroup;

    dataSource: PermissionDataSource | null;
    loading: boolean = false;

    constructor(
        private permService: PermissionService,
        private fb: FormBuilder,
        private router: Router,
        private dialog: MatDialog,
        private msgService: MessageService
    ) { }

    ngOnInit() {
        // fetch initial group list
        this.filterGroups();
        // data source uses onGroupsChanged behavior subject
        this.dataSource = new PermissionDataSource(
            this.permService
        );
        // display columsn for mat table
        this.filterForm = this.fb.group(this.permService.columns);
        this.displayedColumns = this.permService.columns;
    }

    filterGroups()  {
        if (this.loading) {
            return;
        }

        this.loading = true;
        this.permService.getGroups().subscribe(res => {
            this.loading = false;
        });
    }

    sort(ev){
        this.permService.payload.order = ev;
        this.loading = true;
        this.permService.getGroups().subscribe(res => {
            this.loading = false;
        });
    }

    editGroup(permission) {
        this.router.navigate(['/admin/permissions', permission.id]);
    }

    editGroupName(permission, ev) {

        ev.stopPropagation();

        const dialogRef = this.dialog.open(EditGroupNameDialogComponent, {
            width: '300px'
        });

        dialogRef.componentInstance.group = permission.name;

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            this.permService.editGroupName(permission.id, result).subscribe(
                (res: any) => {
                    this.msgService.show(res.msg, res.status);
                    permission.name = result;
                },
                (err: any) => {
                    if (err) {
                        this.msgService.show(err.msg, err.status); 
                    }
                }
            );
        });
    }
}

export class PermissionDataSource extends DataSource<any> {
    constructor(
        private permService: PermissionService
    ) {
        super();
    }

    connect() {
        return this.permService.onGroupsChanged;
    }

    disconnect() {
    }
}
