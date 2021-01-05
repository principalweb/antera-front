import { Component, Inject, ViewEncapsulation, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import * as moment from 'moment';
import { CalendarEvent } from 'angular-calendar';
import { find } from 'lodash';

import { ApiService } from '../../../core/services/api.service';

import { RelatedContactsDialogComponent } from 'app/shared/related-contacts-dialog/related-contacts-dialog.component';
import { RelatedAccountsDialogComponent } from 'app/shared/related-accounts-dialog/related-accounts-dialog.component';
import { Observable } from 'rxjs';
import { displayName, requiredField, visibleField, fieldLabel } from '../../../utils/utils';
import { MessageService } from 'app/core/services/message.service';
import { ModuleField } from 'app/models/module-field';
import { AwsFileManagerComponent } from 'app/shared/aws-file-manager/aws-file-manager.component';
import { AwsCreateDirComponent } from 'app/shared/aws-create-dir/aws-create-dir.component';
import { AwsDocViewerComponent } from 'app/shared/aws-doc-viewer/aws-doc-viewer.component';
import { AwsTaggingComponent } from 'app/shared/aws-tagging/aws-tagging.component';
import { AwsRenameDirComponent } from 'app/shared/aws-rename-dir/aws-rename-dir.component';
import { Logistic, LogisticStates } from 'app/models/logistics';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';


@Component({
    selector: 'logistics-form-dialog',
    templateUrl: './logistics-form.component.html',
    styleUrls: ['./logistics-form.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class LogisticFormDialogComponent implements AfterViewInit {
    @ViewChild(AwsFileManagerComponent) awsfilemanager: AwsFileManagerComponent;
    @ViewChild(AwsCreateDirComponent) awscreatedircomponent: AwsCreateDirComponent;
    @ViewChild(AwsDocViewerComponent) awsdocviewercomponent: AwsDocViewerComponent;
    @ViewChild(AwsTaggingComponent) awstaggingcomponent: AwsTaggingComponent;
    @ViewChild(AwsRenameDirComponent) awsrenamedircomponent: AwsRenameDirComponent;
    @ViewChild('stepper') stepper: MatStepper;

    awsFileManagerType = 'logistics';
    event: CalendarEvent;
    dialogTitle: string;
    logisticForm: FormGroup;
    action: string;
    logistic: Logistic;
    leadSources = [];

    filteredAccounts: any;
    filteredContacts: any;
    filteredStages: any;
    filteredAssignees: Observable<any[]>;

    campaigns = [];
    inventories = [];
    businessTypes: any = [];
    displayName = displayName;
    customerType = 'New';

    eventDate: any;
    dateClosed: any;
    inhandsDate: any;

    @ViewChild(MatAutocompleteTrigger) autoAccount: MatAutocompleteTrigger;
    @ViewChild(MatAutocompleteTrigger) autoContact: MatAutocompleteTrigger;

    loading = false;
    fields = [];

    fieldLabel = fieldLabel;
    visibleField = visibleField;
    requiredField = requiredField;

    logisticStepForm: FormGroup;


    constructor(
        public dialogRef: MatDialogRef<LogisticFormDialogComponent>,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private api: ApiService,
        private msg: MessageService
    ) {
        this.action = data.action;

        if (this.action === 'edit') {
            this.dialogTitle = 'Edit Order Logistics';
            this.logistic = data.logistic;
        }
        else {
            this.dialogTitle = 'New Order Logistics';
            this.logistic = new Logistic();
            if (data.account) {
                this.logistic.accountId = data.account.id;
                this.logistic.accountName = data.account.accountName;
                this.logistic.salesRep = data.account.salesRep;
                this.logistic.salesRepId = data.account.salesRepId;
                this.logistic.contactId = data.account.contactId;
                this.logistic.contactName = data.account.contactName;
                this.logistic.contactEmail = data.account.contactEmail;
            }

            if (data.contact) {
                this.logistic.contactId = data.contact.id;
                this.logistic.contactName = `${data.contact.firstName} ${data.contact.lastName}`;
                this.logistic.contactEmail = data.contact.email;
                this.logistic.salesRep = data.contact.salesRep;
                this.logistic.salesRepId = data.contact.salesRepId;
                this.logistic.leadSource = data.contact.leadSource;
            }
        }
        this.logistic.typeAcct = 'Existing';
        this.customerType = this.logistic.typeAcct;

        this.eventDate = (this.action == 'edit') ? this.logistic.eventDate : '';
        this.dateClosed = (this.action == 'edit') ? this.logistic.dateClosed : '';
        this.inhandsDate = (this.action == 'edit') ? this.logistic.inhandsDate : '';
    }

    ngOnInit() {

        const logisticModuleFieldParams =
        {
            offset: 0,
            limit: 200,
            order: 'module',
            orient: 'asc',
            term: { module: 'Logistics' }
        }
        this.loading = true;
        this.api.getFieldsList(logisticModuleFieldParams)
            .subscribe((res: any[]) => {
                this.fields = res.map(moduleField => new ModuleField(moduleField));
                this.loading = false;
                this.logisticForm = this.createLogisticForm();
                this.logisticStepForm = this.createLogisticStepForm();

                this.setInitialStepperState();
            }, () => { this.loading = false; });
    }

    private setInitialStepperState() {
        setTimeout(() => {
            const stageKey = this.logisticStepForm.get('status').value;
            const stateIndex = LogisticStates.findIndex((state) => state.stageKey === stageKey);
            this.stepper.selectedIndex = stateIndex;
            this.stepper._steps.forEach((step) => {
                step.interacted = false;
            });
        }, 0);
    }

    ngAfterViewInit() {

    }

    nextStep() {
        this.stepper.next();
    }

    get stepsFormArray(): FormArray {
        return this.logisticStepForm.get('steps') as FormArray;
    }

    setStatus(status: string) {
        this.logisticStepForm.get('status').setValue(status);
        this.setInitialStepperState();
    }

    createLogisticStepForm() {
        return this.formBuilder.group({
            id: [this.logistic.id],

            steps: this.formBuilder.array([
                this.formBuilder.group({
                    FRD: [this.logistic.FRD],
                    expectedCartonCount: [this.logistic.expectedCartonCount],
                    expectedPieceCount: [this.logistic.expectedPieceCount],
                }),
                this.formBuilder.group({
                    ETA: [this.logistic.FRD],
                }),
                this.formBuilder.group({
                    ATA: [this.logistic.ATA],
                }),
                this.formBuilder.group({
                    CCD: [this.logistic.CCD],
                    customsAvailable: [this.logistic.customsAvailable],
                    customsCleared: [this.logistic.customsCleared],
                }),
                this.formBuilder.group({
                    PUD: [this.logistic.PUD],
                    PDD: [this.logistic.PDD],
                    ADD: [this.logistic.ADD]
                }),
                this.formBuilder.group({
                    POD: [this.logistic.POD]
                })
            ]),
            orderId: [this.logistic.orderId],
            orderNo: [this.logistic.orderNo],
            accountId: [this.logistic.accountId],
            accountName: [this.logistic.accountName],
            cutOffDate: [this.logistic.cutOffDate],
            ETD: [this.logistic.ETD],
            ETA: [this.logistic.ETA],
            ADT: [this.logistic.ADT],
            ISF: [this.logistic.ISF],
            bookingConfirmation: [this.logistic.bookingConfirmation],
            loadNumber: [this.logistic.loadNumber],
            freightAvailableDate: [this.logistic.freightAvailableDate],
            inRoute: [this.logistic.inRoute],
            trackingNumber: [this.logistic.trackingNumber],
            plannedDeliveryDate: [this.logistic.plannedDeliveryDate],
            actualDeliveryDate: [this.logistic.actualDeliveryDate],
            comments: [this.logistic.comments],
            status: [this.logistic.status],

            dateEntered: [this.logistic.dateEntered],
            dateModified: [this.logistic.dateModified],
            createdByName: [this.logistic.createdByName],
            createdById: [this.logistic.createdById],
            modifiedByName: [this.logistic.modifiedByName],
            modifiedById: [this.logistic.modifiedById],

        });

    }

    createLogisticForm() {
        return this.formBuilder.group({
            id: [this.logistic.id],

            orderId: [this.logistic.orderId],
            orderNo: [this.logistic.orderNo],
            accountId: [this.logistic.accountId],
            accountName: [this.logistic.accountName],
            cutOffDate: [this.logistic.cutOffDate],
            ETD: [this.logistic.ETD],
            ETA: [this.logistic.ETA],
            ADT: [this.logistic.ADT],
            ISF: [this.logistic.ISF],
            bookingConfirmation: [this.logistic.bookingConfirmation],
            loadNumber: [this.logistic.loadNumber],
            customsCleared: [this.logistic.customsCleared],
            freightAvailableDate: [this.logistic.freightAvailableDate],
            inRoute: [this.logistic.inRoute],
            trackingNumber: [this.logistic.trackingNumber],
            plannedDeliveryDate: [this.logistic.plannedDeliveryDate],
            actualDeliveryDate: [this.logistic.actualDeliveryDate],
            comments: [this.logistic.comments],
            POD: [this.logistic.POD],

            dateEntered: [this.logistic.dateEntered],
            dateModified: [this.logistic.dateModified],
            createdByName: [this.logistic.createdByName],
            createdById: [this.logistic.createdById],
            modifiedByName: [this.logistic.modifiedByName],
            modifiedById: [this.logistic.modifiedById],

        });
    }

    selectAccount(ev) {
        const acc = ev.option.value;
        this.logisticForm.patchValue({
            accountId: acc.id,
            accountName: acc.name
        });
        this.api.getRelatedContactsCount({
            accountId: acc.id,
            offset: 0,
            limit: 1000
        }).subscribe((res: any) => {
            if (res.count > 1) {
                this.showRelatedContactsDialog(acc.id);
            } else if (res.count === 1) {
                this.selectRelatedContact(acc.id);
            }
        }, err => { console.log(err) });

    }

    selectContact(ev) {
        const c = ev.option.value;
        this.logisticForm.patchValue({
            contactId: c.id,
            contactName: c.name,
            contactEmail: c.email
        });
        this.api.getRelatedAccountsCount({
            contactId: c.id
        }).subscribe((res: any) => {
            if (res.count > 1) {
                this.showRelatedAccountsDialog(c.id);
            } else if (res.count === 1) {
                this.selectRelatedAccount(c.id);
            }
        });
    }

    selectCampaign(ev) {
        const campaign = ev.option.value;
        this.logisticForm.patchValue({
            campaignId: campaign.id,
            campaignIdExtra: campaign.name
        });
    }

    // Returns the form value with the steps flattened
    getFormValue() {
        let data = { ...this.logisticStepForm.getRawValue() };
        this.stepsFormArray.controls.forEach((control) => {
            data = { ...data, ...control.value };
        });
        delete data.steps;


        return new Logistic(data).toObject();
    }

    create() {
        if (this.logisticStepForm.invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        const logisticData = this.getFormValue();
        this.dialogRef.close(logisticData);
    }

    update() {
        const stageKey = this.logisticStepForm.get('status').value;
        const stateIndex = LogisticStates.findIndex((state) => state.stageKey === stageKey);

        if (this.stepsFormArray.get([stateIndex]).invalid) {
            this.msg.show('Please complete the form first', 'error');
            return;
        }

        const logisticData = this.getFormValue();

        this.dialogRef.close([
            'save',
            logisticData
        ]);
    }

    selectAssignee(ev) {
        const assignee = ev.option.value;
        this.logisticForm.patchValue({
            salesRepId: assignee.id,
            salesRep: assignee.name
        });
    }

    changeCustomerType(ev) {
        this.customerType = ev.value;
    }

    private showRelatedAccountsDialog(contactId) {
        const dlgRef = this.dialog.open(RelatedAccountsDialogComponent, {
            panelClass: 'contacts-select-dialog',
            data: { contactId }
        });
        this.autoContact.closePanel();
        dlgRef.afterClosed().subscribe(res => {
            if (res) {
                this.logisticForm.patchValue({
                    accountId: res.id,
                    accountName: res.accountName
                });
            }
        });
    }

    private selectRelatedAccount(contactId) {
        this.api.getRelatedAccounts({ contactId })
            .subscribe(res => {
                if (res && res[0]) {
                    this.logisticForm.patchValue({
                        accountId: res[0].id,
                        accountName: res[0].accountName
                    });
                }
            });
    }

    private showRelatedContactsDialog(accountId) {
        const dlgRef = this.dialog.open(RelatedContactsDialogComponent, {
            panelClass: 'contacts-select-dialog',
            data: { accountId }
        });

        dlgRef.afterClosed().subscribe(res => {
            this.autoAccount.closePanel();
            if (res) {
                this.logisticForm.patchValue({
                    contactId: res.id,
                    contactName: res.contactName,
                    contactEmail: res.email
                });
            }
        });
    }

    private selectRelatedContact(accountId) {
        this.api.getRelatedContacts({ accountId })
            .subscribe(res => {
                if (res && res[0]) {
                    this.logisticForm.patchValue({
                        contactId: res[0].id,
                        contactName: res[0].contactName,
                        contactEmail: res[0].email
                    });
                }
            });
    }

    private autoCompleteWith(field, func): Observable<any[]> {
        return this.logisticForm.get(field).valueChanges.pipe(
            map(val => displayName(val).trim().toLowerCase()),
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(func),
        )
    }
}
