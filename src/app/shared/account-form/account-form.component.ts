import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector     : 'account-form-dialog',
    templateUrl  : './account-form.component.html',
    styleUrls    : ['./account-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class MailAccountDialogComponent
{
    dialogTitle: string;

    constructor(
        public dialogRef: MatDialogRef<MailAccountDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
    )
    {

    }

}
