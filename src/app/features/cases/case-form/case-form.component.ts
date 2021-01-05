import { Component, Inject, ViewEncapsulation, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Case } from 'app/models';
import { MessageService } from 'app/core/services/message.service';

@Component({
    selector: 'fuse-case-form',
    templateUrl: './case-form.component.html',
    styleUrls: ['./case-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseCaseFormComponent implements OnInit {
    action: string;
    dialogTitle: string;
    case: Case;
    caseForm: FormGroup;

    status = ['Draft', 'In review'];
    priorities = ['Low', 'Medium', 'High'];
    accTypes = ['Administration'];

    constructor(
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) private data: any,
        public dialogRef: MatDialogRef<FuseCaseFormComponent>,
        private msg: MessageService
    ) {
        this.action = data.action;

        if ( this.action === 'edit' ) {
            this.dialogTitle = 'Edit Case';
            this.case = data.case;
        } else {
            this.dialogTitle = 'New Case';
            this.case = new Case({});
        }
    }

    ngOnInit() {
        this.caseForm = this.formBuilder.group({
            number     : [this.case.number],
            status     : [this.case.status],
            priority   : [this.case.priority],
            salesRep   : [this.case.salesRep],
            description: [this.case.description],
            accountName: [this.case.accountName],
            type       : [this.case.type],
            subject    : [this.case.subject],
            resolution : [this.case.resolution],

        });
    }

    save(form) {
        if (this.caseForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        this.dialogRef.close([
            'save',
            {
                ...this.case,
                ...form.getRawValue()
            }
        ]);
    }

}
