import { Component, OnInit, ViewEncapsulation, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { find } from 'lodash';

import { ApiService } from 'app/core/services/api.service';
import { Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { SourceDetails } from 'app/models/source';
import { displayName } from 'app/utils/utils';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import * as moment from 'moment';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MailAccountDialogComponent } from 'app/shared/account-form/account-form.component';
import { MailCredentialsDialogComponent } from 'app/shared/mail-credentials-dialog/mail-credentials-dialog.component';
import { Mail } from 'app/models/mail';
import { EmailVendorsDialogComponent } from '../../email-vendors-dialog/email-vendors-dialog.component';
import { CreateFactoryDialogComponent } from '../../create-factory-dialog/create-factory-dialog.component';
import { PermissionService } from 'app/core/services/permission.service';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
@Component({
  selector: 'app-source-details-tab',
  templateUrl: './details-tab.component.html',
  styleUrls: ['./details-tab.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SourceDetailsTabComponent implements OnInit {
  @Input() action = 'new';
  @Input() sourceDetails: SourceDetails;

  edit = false;
  form: FormGroup;

  statuses = [];
  displayName = displayName;
  quoteValidThrough: any;

  filteredAssignees: Observable<any[]>;
  filteredAccounts: Observable<any[]>;
  filteredContacts: Observable<any[]>;
  filteredVendors = [];
  filteredOpportunities = [];
  permissionsEnabled: boolean;

  relatedVendors = [];
  showAddVendorButton: boolean = false;
  showVendorPrompt = 'Press <enter> to add';

  @ViewChild('relatedVendorInput') relatedVendorInput: ElementRef;
  relatedVendorInputCtrl = new FormControl();

  dialogRef2: MatDialogRef<MailAccountDialogComponent>;
  dialogRef3: MatDialogRef<EmailVendorsDialogComponent>;
  dialogRef: MatDialogRef<MailAccountDialogComponent>;
  credentialsDialogRef: MatDialogRef<MailCredentialsDialogComponent>;

  loading = false;
  loaded = () => {
    this.loading = false;
  }
  filteredSourceAssignees: Observable<any[]>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private msg: MessageService,
    private auth: AuthService,
    private api: ApiService,
    private dialog: MatDialog,
    private permService: PermissionService
  ) {
    this.api.getDropdownOptions({ dropdown: ['sys_sourcing_status_list'] })
      .subscribe((res: any[]) => {
        this.loading = false;
        const sourceDropdown = find(res, { name: 'sys_sourcing_status_list' });
        this.statuses = sourceDropdown.options;
      }, () => {
        this.loading = false;
      });
  }

  ngOnInit() {
    if (this.action === 'edit') {
      this.reloadRelatedSourcingFactories();
      this.sourceDetails.modifiedById = this.auth.getCurrentUser().userId;
      this.sourceDetails.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.sourceDetails.dateModified = new Date();
    }
    else {
      this.edit = true;
      this.sourceDetails.createdById = this.auth.getCurrentUser().userId;
      this.sourceDetails.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
      this.sourceDetails.dateEntered = new Date();
    }

    this.quoteValidThrough = (this.action == 'edit') ? this.sourceDetails.quoteValidThrough : '';

    this.form = this.createSourceDetailsForm();

    this.permService.getPermissionStatus().subscribe((res: any) => {
        if (res == '0' || res == 0 || res == false) {
            res = false
        } else {
            res = true;
        }

        this.permissionsEnabled = res;
    });

  }

  ngAfterViewInit() {
    this.filteredAssignees =
      this.autoCompleteWith('assignedSalesRep', val =>
        this.api.getUserAutocomplete(val)
      );

    this.filteredAccounts =
      this.autoCompleteWith('accountName', val =>
        this.api.getAccountAutocomplete(val)
      );

    this.filteredContacts =
      this.autoCompleteWith('contactName', val =>
        this.api.getContactAutocomplete(val)
      );

    this.filteredSourceAssignees = this.autoCompleteWith('assignedSourcingRep', val => 
      this.api.getUserAutocomplete(val)
    );
    
    this.relatedVendorInputCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
        const query: string = displayName(keyword).trim().toLowerCase();
        if (query.length >= 3) {
          this.api.getVendorAutocomplete(query).subscribe((res: any[]) => {
            this.filteredVendors = res;

            if (this.filteredVendors.length === 0) {
              this.showAddVendorButton = true;
              this.filteredVendors = [{ value: 'add_new', name: this.showVendorPrompt + ' ' + keyword, keyword: keyword }];
            } else {
              this.showAddVendorButton = false;
            }
          });
        } else {
          this.showAddVendorButton = false;
        }
    });

    this.form.get('opportunityNo').valueChanges.pipe(
      map(val => typeof val === 'string' ? val : val.opportunityNo),
      debounceTime(400),
      distinctUntilChanged(),
    ).subscribe(keyword => {
        this.api.getOpportunityAutocomplete(keyword).subscribe((res: any[]) => {
          this.filteredOpportunities = res;
        });
    });
  }

  createSourceDetailsForm() {
    return this.formBuilder.group({
      gcName: [this.sourceDetails.gcName, Validators.required],
      gcItemNumber: [this.sourceDetails.gcItemNumber],
      size: [this.sourceDetails.size],
      material: [this.sourceDetails.material],
      specifications: [this.sourceDetails.specifications, Validators.required],
      decorationType: [this.sourceDetails.decorationType],
      testingRequirements: [this.sourceDetails.testingRequirements],
      status: [this.sourceDetails.status, Validators.required],
      assignedSalesRep: [this.sourceDetails.assignedSalesRep, Validators.required],
      assignedSalesRepId: [this.sourceDetails.assignedSalesRepId, Validators.required],
      dateEntered: [this.sourceDetails.dateEntered],
      dateModified: [this.sourceDetails.dateModified],
      createdById: [this.sourceDetails.createdById],
      createdByName: [this.sourceDetails.createdByName],
      modifiedById: [this.sourceDetails.modifiedById],
      modifiedByName: [this.sourceDetails.modifiedByName],
      // Extended fields
      accountId: [this.sourceDetails.accountId, Validators.required],
      accountName: [this.sourceDetails.accountName, Validators.required],
      contactId: [this.sourceDetails.contactId, Validators.required],
      contactName: [this.sourceDetails.contactName, Validators.required],
      quantity1: [this.sourceDetails.quantity1],
      pricePerQty1: [this.sourceDetails.pricePerQty1],
      quantity2: [this.sourceDetails.quantity2],
      pricePerQty2: [this.sourceDetails.pricePerQty2],
      quantity3: [this.sourceDetails.quantity3],
      pricePerQty3: [this.sourceDetails.pricePerQty3],
      quantity4: [this.sourceDetails.quantity4],
      pricePerQty4: [this.sourceDetails.pricePerQty4],
      quantity5: [this.sourceDetails.quantity5],
      pricePerQty5: [this.sourceDetails.pricePerQty5],
      // Image
      featureImage: [this.sourceDetails.images[0]],
      opportunityId: [this.sourceDetails.opportunityId, Validators.required],
      opportunityNo: [this.sourceDetails.opportunityNo, Validators.required],

      assignedSourcingRep: [this.sourceDetails.assignedSourcingRep, Validators.required],
      assignedSourcingRepId: [this.sourceDetails.assignedSourcingRepId, Validators.required],
    });
  }


  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.form.patchValue({
      assignedSalesRepId: assignee.id,
      assignedSalesRep: assignee.name
    });
  }

  selectAssignedSourcing(ev) {
    const assignee = ev.option.value;
    this.form.patchValue({
        assignedSourcingRepId: assignee.id,
        assignedSourcingRep: assignee.name
    });
  }

  selectAccount(ev) {
    const acc = ev.option.value;
    this.form.patchValue({
      accountId: acc.id,
      accountName: acc.name
    });
  }

  selectContact(ev) {
    const cc = ev.option.value;
    this.form.patchValue({
      contactId: cc.id,
      contactName: cc.name
    });
  }

  selectOpportunity(ev) {
    const oo = ev.option.value;
    this.form.patchValue({
      opportunityId: oo.id,
      opportunityNo: oo.opportunityNo
    });
  }

  private autoCompleteWith(field, func): Observable<any[]> {
    return this.form.get(field).valueChanges.pipe(
        map(val => displayName(val).trim().toLowerCase()),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(func),
    )
  }

  displayOportunityNo = (val: any) => {
    if (!val) {
      return '';
    } else if (typeof val === 'string') {
      return val;
    }
    return val.opportunityNo;
  }

  toggleEdit() {
    this.edit = !this.edit;
  }

  update() {
    if (this.form.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    if (!moment(this.quoteValidThrough).isValid()) {
      this.msg.show('Please select the date for Quote Valid Through.', 'error');
      return;
    }

    const data = {
      ...this.form.value,
      id: this.sourceDetails.id,
      sourcingId: this.sourceDetails.sourcingId,
      quoteValidThrough: moment(this.quoteValidThrough).format('YYYY-MM-DD')
    }

    this.sourceDetails.setData(data);
    if (this.form.value.featureImage) {
      this.sourceDetails.images = [this.form.value.featureImage];
    } else {
      this.sourceDetails.images = [];
    }

    this.loading = true;
    this.api.updateSource(this.sourceDetails.toObject())
      .subscribe(() => {
        this.edit = false;
        this.loaded();
      }, this.loaded);
  }

  create() {
    if (this.form.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const data = { ...this.form.value }

    this.sourceDetails.setData(data);
    this.loading = true;
    this.api.createSource(this.sourceDetails.toObject())
      .subscribe((res: any) => {
        this.loading = false;
        this.router.navigate(['/e-commerce/sources', res.extra.id]);
      }, this.loaded);
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      const data = new FormData();
      data.append('sourcingFile', file);
      data.append('sourcingId', this.sourceDetails.id);
      data.append('accountId', this.sourceDetails.accountId);

      this.loading = true;
      this.api.uploadSourceImage(data)
        .subscribe((res: any) => {
          this.form.patchValue({
            featureImage: res.url
          });
          this.loading = false;
          this.update();
        }, this.loaded);
    }
  }

  removeFeaturedImage() {
    this.form.patchValue({
      featureImage: ''
    });
    this.update();
  }

  reloadRelatedSourcingFactories() {
    this.loading = true;
    this.api.getRelatedSourcingFactories(this.sourceDetails.id)
      .subscribe((vendors: any[]) => {
        this.loading = false;
        this.relatedVendors = vendors;
      }, this.loaded);
  }

  vendorSelected(event: MatAutocompleteSelectedEvent): void {
    this.relatedVendorInput.nativeElement.value = '';
    if (this.action == 'edit') {
      let vendor = event.option.value;

      if (vendor.value === 'add_new') {
        this.createFactoryAccountAndRelation(vendor.keyword);
      } else {
        this.createSourcingFactoryRelation(this.sourceDetails.id, vendor.id);
      }
    }
  }

  createFactoryAccountAndRelation(term: string) {
    this.showAddVendorButton = false;
    this.filteredVendors = [];
    return this.createFactory(term).afterClosed().subscribe((res) => {
      if (res) {
        this.api.createAccount(res).subscribe((accountRes: any) => {
          this.createSourcingFactoryRelation(this.sourceDetails.id, accountRes.extra.id);
        });
      }
    });
  }

  createSourcingFactoryRelation(sourceId, factoryId) {
    this.loading = true;
    this.api.createSourcingFactoriesRelation(sourceId, factoryId)
      .subscribe((res) => {
        this.reloadRelatedSourcingFactories();
      }, (err) => {
        this.loading = false;
        this.msg.show('Linking vendor & source failed', 'error');
      });
  }

  createFactory(name = '') {
    let factoryDialogRef = this.dialog.open(CreateFactoryDialogComponent, {
      panelClass: 'create-factory-dialog',
      data: {
        accountName: name
      }
    });
    return factoryDialogRef;
  }

  sendEmail() {
    this.loading = true;
    const userId = this.auth.getCurrentUser().userId;
    this.api.getMailCredentials(userId)
      .subscribe((res) => {
        this.loading = false;
        if (!res || (res && (res.smtpPass == '' || res.smtpPort == '' || res.smtpServer == '' || res.smtpUser == ''))) {
          this.credentialsDialogRef = this.dialog.open(MailCredentialsDialogComponent, {
            panelClass: 'mail-credentials-dialog'
          });
          this.credentialsDialogRef.afterClosed()
            .subscribe((res) => {
              this.dialogRef = null;
              if (res && res == 'saved') {
                this.sendEmail();
              }
            });
          return;
        }
        this.openCompose();

      }, (err) => {
        this.loading = false;
        console.log(err);
      });
  }

  openCompose() {
    const basicMailData = {
      subject: `Source inquiry ${this.sourceDetails.id}`,
      // attachments: [{ filename: filename, size: '', data: base64str.split('base64,')[1], mimetype: 'application/pdf' }]
    };


    let mail = new Mail(basicMailData);
    this.dialogRef3 = this.dialog.open(EmailVendorsDialogComponent, {
      panelClass: 'compose-mail-dialog',
      data: {
        action: 'Send',
        mail: mail
      }
    });

    this.dialogRef3.afterClosed().subscribe((res) => {
      if (!res) {
        return;
      }
      this.dialogRef = null;
      if (!res) {
        return;
      }

      const baseUrl = location.origin;
      const message = res.mail.body;

      // this.loading = true;
      this.relatedVendors.forEach((vendor) => {
        let _link = `${baseUrl}/external/factories/${this.sourceDetails.sourcingId}/${vendor.id}`;
        const _body = `<h3>Source Inquiry Request</h3><br>` + message + `<br><a href="${_link}">View Request</a>`;

        this.api.getAccountEmail(vendor.id).subscribe((email: any) => {
          if (validateEmail(email)) {
            let _mail = new Mail(basicMailData);
            _mail = res.mail;
            _mail.to = [email];
            _mail.body = _body;
            const data = new FormData();
            data.append('userId', this.auth.getCurrentUser().userId);
            data.append('to', _mail.to.join(','));
            data.append('from', _mail.from);
            data.append('subject', _mail.subject);
            data.append('body', _mail.body);

            this.api.sendMailSMTP(data).subscribe((res: any) => {
                        if (res.status && res.status == 'success') {
                            this.msg.show('Email sent','success');
                        }
                        else{
                            this.msg.show('Failed to send email','error');
                        }
                    }, (err) => {
                        console.log(err);
                    });

            console.log("\tSending", mail);
          }
        });
      });
    });

  }

  removeVendor(vendor) {
    if (this.action == 'edit') {
      this.loading = true;
      this.api.removeSourcingFactoriesRelation(this.sourceDetails.id, vendor.id)
        .subscribe((response: any) => {
          this.msg.show(response.msg, 'success');
          if (response.status === 'Success') {
            this.reloadRelatedSourcingFactories();
          }
        }, (err) => {
          this.loading = false;
          this.msg.show('Removing related account & contact failed', 'error');
        });
    }
  }
}
