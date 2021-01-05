import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MessageService } from 'app/core/services/message.service';
import { AuthService } from 'app/core/services/auth.service';
import { DecoTypeGroupsDetails } from 'app/models/deco-type-groups';
import { DecoTypeGroupsService } from '../deco-type-groups.service';

import { IntegrationService } from 'app/core/services/integration.service';

import { Observable, interval } from 'rxjs';
import { debounce, startWith, switchMap, map } from 'rxjs/operators';

import { TaxCategory } from 'app/models/tax-category';
import { RestParams } from 'app/models/rest-params';
import { TaxCollection } from 'app/models/tax-collection';

@Component({
  selector: 'app-deco-type-groups-form',
  templateUrl: './deco-type-groups-form.component.html',
  styleUrls: ['./deco-type-groups-form.component.scss']
})
export class DecoTypeGroupsFormComponent implements OnInit {

  dialogTitle: string;
  action: string;
  decoTypeGroupsForm: FormGroup;
  
  decoTypeGroupsDetails: DecoTypeGroupsDetails;
  loading: false;

  restParams: RestParams;
  categories: Observable<TaxCategory[]>;
  // need to come up with a way to model rest filters
  filters = {
    terms: {
      name: ''
    },
    operator: {
      name: 'like'
    }
  }

  constructor(
    public dialogRef: MatDialogRef<DecoTypeGroupsFormComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
    private formBuilder: FormBuilder,
    private msg: MessageService,
    private auth: AuthService,
    private decoTypeGroupsService: DecoTypeGroupsService,
    public integrationService: IntegrationService,
  )
  {

    this.action = data.action;
    if ( this.action === 'edit' )
    {
        this.dialogTitle = 'Edit Deco Type Groups';
        this.decoTypeGroupsDetails = data.decoTypeGroupsDetails;
        this.decoTypeGroupsDetails.modifiedById = this.auth.getCurrentUser().userId;
        this.decoTypeGroupsDetails.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
        this.decoTypeGroupsDetails.dateModified = new Date();
    }
    else
    {
        this.dialogTitle = 'Create Deco Type Groups';
        this.decoTypeGroupsDetails = new DecoTypeGroupsDetails();
        this.decoTypeGroupsDetails.createdById = this.auth.getCurrentUser().userId;
        this.decoTypeGroupsDetails.createdByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
        this.decoTypeGroupsDetails.dateEntered = new Date();
    }
    this.decoTypeGroupsForm = this.createDecoTypeGroupsForm();
  }

  createDecoTypeGroupsForm()
  {

    return this.formBuilder.group({
      name               : [this.decoTypeGroupsDetails.name, Validators.required],
      status             : [this.decoTypeGroupsDetails.status],
      taxJarObj          : [this.decoTypeGroupsDetails.taxJarObj],
      dateEntered        : [this.decoTypeGroupsDetails.dateEntered],
      dateModified       : [this.decoTypeGroupsDetails.dateModified],
      createdById        : [this.decoTypeGroupsDetails.createdById],
      createdByName      : [this.decoTypeGroupsDetails.createdByName],
      modifiedById       : [this.decoTypeGroupsDetails.modifiedById],
      modifiedByName     : [this.decoTypeGroupsDetails.modifiedByName]
    });
  }

  ngOnInit() {
    this.categories = this.decoTypeGroupsForm.get("taxJarObj").valueChanges.pipe(
      debounce(() => interval(500)),
      startWith<string | TaxCategory>(''),
      switchMap(value => {
        const init = { page: 1, perPage: 20, order: 'name', orient: 'asc' }
        const params = new RestParams(init);
        value = typeof value === 'undefined' ? '' : value;
        this.filters.terms.name = (typeof value === 'string' ? value : value.name);
        return this.integrationService.getTaxCategories(this.filters, params).pipe(
          map((res: TaxCollection) => {
            return res.data;
          })
        )
      }),
      map((res: TaxCategory[]) =>  {return res})
    )
  }

  create() {
    if (this.decoTypeGroupsForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    const data = {
      ...this.decoTypeGroupsForm.value
    }
    this.decoTypeGroupsDetails.setData(data);
    this.dialogRef.close(this.decoTypeGroupsDetails);
  }

  update() {

    if (this.decoTypeGroupsForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    const data = {
      ...this.decoTypeGroupsForm.value,
      id: this.decoTypeGroupsDetails.id
    }
    this.decoTypeGroupsDetails.setData(data);
    this.dialogRef.close(this.decoTypeGroupsDetails);
  }

  displayFn(category?: TaxCategory): string | undefined {
    return category ? category.name : undefined;
  }
}
