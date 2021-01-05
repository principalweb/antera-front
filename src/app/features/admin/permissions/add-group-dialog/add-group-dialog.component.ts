import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-group-dialog',
  templateUrl: './add-group-dialog.component.html',
  styleUrls: ['./add-group-dialog.component.scss']
})
export class AddGroupDialogComponent {

    group: string = '';

    constructor(
        public dialogRef: MatDialogRef<AddGroupDialogComponent>
    ) {}

    cancelClick(): void {
        this.dialogRef.close();
    }

    ngOnInit() {
    }

}
