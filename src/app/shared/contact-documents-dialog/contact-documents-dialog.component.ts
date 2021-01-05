import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { sortBy, findIndex, each, remove } from 'lodash';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { ContactsService } from 'app/core/services/contacts.service';
import { AuthService } from 'app/core/services/auth.service';
import { requiredField } from 'app/utils/utils';
import { ApiService } from 'app/core/services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-contact-documents-dialog',
  templateUrl: './contact-documents-dialog.component.html',
  styleUrls: ['./contact-documents-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ContactDocumentsDialogComponent implements OnInit {
  contact: any;
  account: any;
  documentTags: any;
  filteredDocuments: any[] = [];
  selectedDocuments: any[] = [];
  form: FormGroup;
  availableDocuments: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<ContactDocumentsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,
    private formBuilder: FormBuilder,
    private service: ContactsService,
    private api: ApiService,
  ) {
    this.contact = data.contact;
    this.account = data.account;
  }

  ngOnInit() {
    this.service.getDropdownOptionsForTags({}).subscribe((res) => {
      this.documentTags = res;
      this.filteredDocuments = sortBy(this.documentTags, 'name');
      this.filterAvailableDocuments();
    });
    this.form = this.createForm();
  }

  compareDocuments(o1: any, o2: any) {
    return o1 === o2;
  }

  createForm() {
    const form = this.formBuilder.group({
      tags: this.formBuilder.array([]),
      addDocument: null,
      selectDocuments: null,
    });

    const tagsFormArray = form.get('tags') as FormArray;

    if (this.contact && this.contact.tags) {
      const selectedDocuments = [];
      for (let index = 0; index < this.contact.tags.length; index++) {
        const tag = this.contact.tags[index];
        const control = this.createTagControl(tag);
        selectedDocuments.push({ id: tag.tagId, name: tag.tagName });
        tagsFormArray.push(control);
      }

      const _selectDocumentIds = selectedDocuments.map((item) => item.id);
      this.selectedDocuments = selectedDocuments;
      form.get('selectDocuments').setValue(_selectDocumentIds);
    }
    this.filterAvailableDocuments();

    return form;
  }

  filterAvailableDocuments() {
    this.availableDocuments = this.filteredDocuments.filter((doc) => {
      return !this.selectedDocuments.some((selected) => selected.id === doc.id);
    });
  }

  get tagsFormArray() {
    return this.form.get('tags') as FormArray;
  }
  createTagControl(data) {
    return this.formBuilder.group(data);
  }

  addDocument(event) {
    const item = this.filteredDocuments.find((doc) => {
      return doc.id === event.value;
    });
    if (item) {
      this.selectedDocuments.push(item);

      const tag = {
        tagId: item.id,
        tagName: item.name,
        mailTo: 'To'
      };
      // Add control
      const control = this.createTagControl(tag);
      this.tagsFormArray.push(control);
    }
    this.form.get('addDocument').setValue(null);
    this.filterAvailableDocuments();
  }

  removeDocument(control) {
    const value = control.value;
    // Remove control
    this.tagsFormArray.controls.forEach((control, i) => {
      if (control.value && control.value.tagId === value.tagId) {
        this.tagsFormArray.removeAt(i);
      }
    });
    remove(this.selectedDocuments, { id: value.tagId });
    this.filterAvailableDocuments();
  }

  changeSelectedDocuments(tags) {
    each(this.filteredDocuments, item => {
      if (tags.indexOf(item.id) > -1) {
        const j = findIndex(this.selectedDocuments, { id: item.id });
        if (j < 0) {
          this.selectedDocuments.push(item);

          let tag = {
            tagId: item.id,
            tagName: item.name,
            mailTo: 'To'
          };

          // Add control
          const control = this.createTagControl(tag);
          this.tagsFormArray.push(control);
        }
      } else {
        // Remove control
        this.tagsFormArray.controls.forEach((control, i) => {
          if (control.value && control.value.tagId === item.id) {
            this.tagsFormArray.removeAt(i);
          }
        });

        remove(this.selectedDocuments, { id: item.id });
      }
    });
    this.selectedDocuments = this.selectedDocuments.slice(0);
    this.filterAvailableDocuments();
  }

  save() {
    let originalTags = this.contact.tags;
    let tags = this.form.get('tags').value;

    let actions = tags.reduce((actions, tag, idx) => {
      let isInOriginal = originalTags.some((item) => item.tagId == tag.tagId);

      if (isInOriginal) {
        actions.update.push(tag);
      } else {
        actions.create.push(tag);
      }
      return actions;
    }, { create: [], update: [], delete: [] });
    actions.delete = originalTags.filter((x) => !tags.some((y) => y.tagId == x.tagId));
    console.log(tags, originalTags, actions);

    let requests = [];
    let idsToDelete = actions.delete.map((item) => item.RelateTagId);

    const addCreateOrUpdateRequest = (action) => {
      let payload = {
        'recordId': this.contact.id,
        'module': 'Contacts',
        'tagIds': [action.tagId],
        'mailTo': action.mailTo,
        'parentRecordId': this.account.id,
        'parentModule': 'Accounts'
      };

      requests.push(this.api.assignContactTag(payload));
    };

    actions.create.forEach(action => addCreateOrUpdateRequest(action));
    actions.update.forEach(action => addCreateOrUpdateRequest(action));
    if (idsToDelete.length) {
      requests.push(this.api.removeContactTags(idsToDelete));
    }

    forkJoin(requests).subscribe(res => {
      this.dialogRef.close('success');
    });

  }
}
