import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-group-name-dialog',
  templateUrl: './edit-group-name-dialog.component.html',
  styleUrls: ['./edit-group-name-dialog.component.scss']
})
export class EditGroupNameDialogComponent {
  public group: any;

  constructor(
    public dialogRef: MatDialogRef<EditGroupNameDialogComponent>
  ) { }

  cancelClick(): void {
      this.dialogRef.close();
  }

  ngOnInit() {
  }

}
