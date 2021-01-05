import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { AuthService } from 'app/core/services/auth.service';
import { MessageService } from 'app/core/services/message.service';
import { EmailTemplate } from 'app/models/email-template';
import { fx2N } from 'app/utils/utils';
import { displayName } from '../../../productions/utils';
import { EmailTemplatesService } from '../email-templates.service';
import { CKEditorComponent } from '@ckeditor/ckeditor5-angular/ckeditor.component';


function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

@Component({
  selector: 'app-email-template-form',
  templateUrl: './email-template-form.component.html',
  styleUrls: ['./email-template-form.component.scss'],
  animations: fuseAnimations
})
export class EmailTemplateFormComponent implements OnInit {
  Editor = ClassicEditor;
  @ViewChild('editor') editor: ElementRef;

  title: string;
  form: FormGroup;
  action: string;
  template: EmailTemplate;
  displayName = displayName;

  filteredSalesReps: any;
  fx2N = fx2N;

  loading = false;
  edit = false;
  mergeTags: string[] = [
    '$orderIdentity',
    '$orderNumber',
    '$contactName',
    '$contactFirstName',
    '$productionManagerName',
    '$productionManagerEmail',
    '$productionManagerPhone',
    '$accountName',
    '$contactEmail',
    '$department',
    '$primaryAddress',
    '$primaryCityStatePin',
    '$phoneHome',
    '$phoneMobile',
    '$phoneWork',
    '$phoneFax',
    '$currentDate',
    '$clientCompany',
    '$clientWebsite',
    '$clientPhone',
    '$fromUser',
    '$salesPersonName',
    '$salesPersonEmail',
    '$csrName',
    '$csrEmail',
    '$contactBillingEmail',
    '$contactNoticesEmail',
    '$contactProofsEmail',
    '$vendorEmail',
    '$vendorArtEmail',
    '$vendorName',
    '$scheduledShippingDate',
    '$shippingMethod',
    '$trackingNumber',
    '$actualShippingDate',
    '$expectedArrivalDate',
    '$multipleShipping',
    '$crmUserName',
    '$crmUserEmail',
    '$crmUserPhone',
    '$proofUrl',
    '$customerProofStatusUpdateURLs',
    '$vendorArtworks',
    '$vendorProofs',
    '$expectedPrintDateOrderForm',
    '$factoryShipDateOrderForm',
    '$shipDateOrderForm',
    '$supplierShipDateOrderForm',
    '$dueDateOrderForm',
    '$inHandDateByOrderForm',
    '$orderDateOrderForm',
    '$proofDueDateOrderForm',
    '$supplierInHandsDateOrderForm',
  ];

  data: any;

  loaded = () => {
    this.loading = false;
  };
  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private msg: MessageService,
    private auth: AuthService,
    private templateService: EmailTemplatesService,
    private router: Router,
  ) {

    this.data = route.snapshot.data;
    this.template = new EmailTemplate(this.data.template);

    if (this.template.id === '') {
      this.action = 'create';
      this.title = 'New Template';
      this.edit = false;
    } else {
      this.action = 'edit';
      this.title = `Editing ${this.template.name}`;
      this.edit = true;
    }

    this.form = this.createEmailTemplateForm();
  }

  ngOnInit() {
  }

  createEmailTemplateForm() {
    return this.formBuilder.group({
      id: this.template.id,
      name: [this.template.name, Validators.required],
      description: this.template.description,
      subject: this.template.subject,
      body: this.template.body,
      bodyHtml: this.template.bodyHtml,
      bccEmail: this.template.bccEmail,
      ccEmail: this.template.ccEmail,
    });
  }

  create() {
    if (this.form.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    this.template.setData(this.form.value);
    const user = this.auth.getCurrentUser();
    this.template.modifiedById = user.userId;

    this.template.slug = slugify(this.template.name);

    // this.dialogRef.close(this.template);
    console.log('Save template', this.template);
  }

  save() {
    if (this.form.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    const user = this.auth.getCurrentUser();

    this.template.setData(this.form.value);
    this.template.modifiedById = user.userId;

    if (!this.template.slug) {
      this.template.slug = slugify(this.template.name);
    }

    let request = (this.action === 'create')
      ? this.templateService.create(this.template)
      : this.templateService.update(this.template);

    request.subscribe(() => {
      const _action = this.action === 'create' ? 'created' : 'updated';
      this.msg.show(`Template ${_action} successfully`, 'success');
      this.edit = true;
      this.router.navigate(['admin', 'email-templates']);
    }, err => {
      this.msg.show('Error occurred saving the template', 'error');
    });

    console.log('Updating template', this.template);
  }

  insertMergeTag(ev) {
    // @ts-ignore
    const instance = this.editor.editorInstance;
    instance.model.change(writer => {
      writer.insertText(ev.value, instance.model.document.selection.getFirstPosition());
    });
    ev.source.value = null;
  }

  selectSalesRep(ev) {
    const data = ev.option.value;
    this.form.patchValue({
      assignedSalesRep: data.name,
      assignedSalesRepId: data.id
    });
  }
}
