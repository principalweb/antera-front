import { Component, Inject, Input, ViewEncapsulation, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';


import { Workflow } from '../workflow.model';
import { MessageService } from 'app/core/services/message.service';

@Component({
    selector: 'fuse-workflow-form',
    templateUrl: './workflow-form.component.html',
    styleUrls: ['./workflow-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FuseWorkflowFormComponent implements OnInit {
    action: string;
    dialogTitle: string;
    workflow: Workflow;
    workflowForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) data: any,
        public dialogRef: MatDialogRef<FuseWorkflowFormComponent>,
        private msg: MessageService
    ) {
        this.action = data.action;

        if ( this.action === 'edit' ) {
            this.dialogTitle = 'Edit WorkFlow';
            this.workflow = data.workflow;
        } else {
            this.dialogTitle = 'New Workflow';
            this.workflow = new Workflow({});
        }
    }

    ngOnInit() {
        this.workflowForm = this.formBuilder.group({
            orderNumber: [this.workflow.orderNumber, Validators.required],
            identity: [this.workflow.identity],
            account: [this.workflow.account, Validators.required],
            vendor: [this.workflow.vendor],
            amount: [this.workflow.amount],
            proof: [this.workflow.proof],
            links: '',
            inHands: [this.workflow.inHands],
            processing: [this.workflow.processing],
            salesRep: [this.workflow.salesRep],
            csr: [this.workflow.csr],
            qbSync: [this.workflow.qbSync],
            scheduled: ''
        });
    }

    save(form) {
        if (this.workflowForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }
        this.dialogRef.close([
            'save',
            {
                ...this.workflow,
                ...form.getRawValue()
            }
        ]);
    }

}
