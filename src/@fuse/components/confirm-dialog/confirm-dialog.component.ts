import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'fuse-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class FuseConfirmDialogComponent {
    confirmDialogTitle: string;
    confirmMessage: string;
    confirmNote: string;
    confirmButtonText: string;
    cancelButtonText: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) data: any,
        private dialogRef: MatDialogRef<FuseConfirmDialogComponent>,
    ) {

        if (!data) data = {};

        this.confirmDialogTitle = data.confirmDialogTitle || "Confirm";
        this.confirmMessage = data.confirmMessage || "";
        this.confirmNote = data.confirmNote || "";
        this.confirmButtonText = data.confirmButtonText || "Confirm";
        this.cancelButtonText = data.cancelButtonText || "Cancel";
    }

    close(result: boolean) {
        this.dialogRef.close(result)
    }

}
