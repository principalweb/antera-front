import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { find } from 'lodash';
import { Project } from 'app/models';
import { ProjectsService } from 'app/core/services/projects.service';
import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';
import { Subscription, Observable } from 'rxjs';
import { displayName } from '../../utils';
import { fuseAnimations } from '@fuse/animations';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { fieldLabel, visibleField, requiredField } from 'app/utils/utils';
import { ModuleField } from 'app/models/module-field';
import { MessageService } from 'app/core/services/message.service';
import { ProjectDetailsComponent } from '../project-details.component';
import { CustomValidators } from 'app/shared/validators/validators';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-project-details-tab',
  templateUrl: './project-details-tab.component.html',
  styleUrls: ['./project-details-tab.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ProjectDetailsTabComponent implements OnInit {
  @Input() action = 'new';
  @Input() project: Project;
  @Output() afterCreate = new EventEmitter();
  @ViewChild(ProjectDetailsComponent) projectdetailscomponent: ProjectDetailsComponent;

  projectForm: FormGroup;
  fields = [];
  fieldLabel = fieldLabel;
  visibleField = visibleField;
  requiredField = requiredField;
  edit = false;
  status = ['Draft', 'In review', 'Published'];
  priorities = ['Low', 'Medium', 'High'];
  presentationLayouts = ['Catalog', 'Page Template'];
  loading: boolean = false;
  filteredAssignees: Observable<any[]>;
  filteredAccountManager: Observable<any[]>;
  filteredAccounts: Observable<any[]>;
  displayName = displayName;
  
  constructor(
    private service: ProjectsService,
    private dialog: MatDialog,
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private msg: MessageService,
    private elRef: ElementRef,
    private auth: AuthService,
  ) { }

  ngOnInit() {
    if (this.action !== 'edit') {
      this.edit = true;
    }

    const projectsModuleFieldParams =
    {
      offset: 0,
      limit: 1000,
      order: 'module',
      orient: 'asc',
      term: { module: 'Projects' }
    }
    this.loading = true;
    this.api.getFieldsList(projectsModuleFieldParams)
      .subscribe((res: any[]) => {
        this.fields = res.map(moduleField => new ModuleField(moduleField));
        console.log(this.fields);
        this.loading = false;
        this.initForm();
      }, () => { this.loading = false; });
    
  }

  initForm(){

    this.projectForm = this.fb.group({
        name       : [this.project.name, Validators.required],
        description: requiredField('description', this.fields) ? [this.project.description, Validators.required] : [this.project.description],
        dateCreated: requiredField('dateCreated', this.fields) ? [this.project.dateCreated, Validators.required] : [this.project.dateCreated],
        dateModified: requiredField('dateModified', this.fields) ? [this.project.dateModified, Validators.required] : [this.project.dateModified],
        accountManagerId: requiredField('accountManagerName', this.fields) ? [this.project.accountManagerId, Validators.required] : [this.project.accountManagerId],
        accountManagerName: requiredField('accountManagerName', this.fields) ? [this.project.accountManagerName, Validators.required] : [this.project.accountManagerName],
        assignedUserId: requiredField('assignedUserName', this.fields) ? [this.project.assignedUserId, Validators.required] : [this.project.assignedUserId],
        assignedUserName: requiredField('assignedUserName', this.fields) ? [this.project.assignedUserName, Validators.required] : [this.project.assignedUserName],
        modifiedUserId: requiredField('modifiedUserName', this.fields) ? [this.project.modifiedUserId, Validators.required] : [this.project.modifiedUserId],
        modifiedUserName: requiredField('modifiedUserName', this.fields) ? [this.project.modifiedUserName, Validators.required] : [this.project.modifiedUserName],
        createdById: requiredField('createdByName', this.fields) ? [this.project.createdById, Validators.required] : [this.project.createdById],
        createdByName: requiredField('createdByName', this.fields) ? [this.project.createdByName, Validators.required] : [this.project.createdByName],
        estimatedStartDate: requiredField('estimatedStartDate', this.fields) ? [this.project.estimatedStartDate, Validators.required] : [this.project.estimatedStartDate],
        estimatedEndDate: requiredField('estimatedEndDate', this.fields) ? [this.project.estimatedEndDate, Validators.required] : [this.project.estimatedEndDate],
        dueDate: requiredField('dueDate', this.fields) ? [this.project.dueDate, Validators.required] : [this.project.dueDate],
        status: requiredField('status', this.fields) ? [this.project.status, Validators.required] : [this.project.status],
        priority: requiredField('priority', this.fields) ? [this.project.priority, Validators.required] : [this.project.priority],
        accountId: requiredField('accountName', this.fields) ? [this.project.accountId, Validators.required] : [this.project.accountId],
        accountName: requiredField('accountName', this.fields) ? [this.project.accountName, Validators.required] : [this.project.accountName],
        converted: requiredField('converted', this.fields) ? [this.project.converted, Validators.required] : [this.project.converted],
        presentationLayout: requiredField('presentationLayout', this.fields) ? [this.project.presentationLayout, Validators.required] : [this.project.presentationLayout],
        textFieldExtra1: requiredField('textFieldExtra1', this.fields) ? [this.project.textFieldExtra1, Validators.required] : [this.project.textFieldExtra1],
        textFieldExtra2: requiredField('textFieldExtra2', this.fields) ? [this.project.textFieldExtra2, Validators.required] : [this.project.textFieldExtra2],
        textFieldExtra3: requiredField('textFieldExtra3', this.fields) ? [this.project.textFieldExtra3, Validators.required] : [this.project.textFieldExtra3],
        textFieldExtra4: requiredField('textFieldExtra4', this.fields) ? [this.project.textFieldExtra4, Validators.required] : [this.project.textFieldExtra4],
        textFieldExtra5: requiredField('textFieldExtra5', this.fields) ? [this.project.textFieldExtra5, Validators.required] : [this.project.textFieldExtra5],
        textFieldExtra6: requiredField('textFieldExtra6', this.fields) ? [this.project.textFieldExtra6, Validators.required] : [this.project.textFieldExtra6],
        textFieldExtra7: requiredField('textFieldExtra7', this.fields) ? [this.project.textFieldExtra7, Validators.required] : [this.project.textFieldExtra7],
        textFieldExtra8: requiredField('textFieldExtra8', this.fields) ? [this.project.textFieldExtra8, Validators.required] : [this.project.textFieldExtra8],
        textFieldExtra9: requiredField('textFieldExtra9', this.fields) ? [this.project.textFieldExtra9, Validators.required] : [this.project.textFieldExtra9],
        textFieldExtra10: requiredField('textFieldExtra10', this.fields) ? [this.project.textFieldExtra10, Validators.required] : [this.project.textFieldExtra10],
        });

    this.filteredAssignees =
      this.autoCompleteWith('assignedUserName', val =>
        this.api.getUserAutocomplete(val)
      );

    this.filteredAccountManager =
      this.autoCompleteWith('accountManagerName', val =>
        this.api.getUserAutocomplete(val)
      );


    this.filteredAccounts =
      this.autoCompleteWith('accountName', val =>
        this.api.getCustomerAutocomplete(val)
      );


  }
  toggleEdit() {
    this.edit = !this.edit;
  }

  convert() {
    if (this.projectForm.invalid) {
      this.msg.show('Please save the project first with all required details.', 'error');
      return;
    }
    this.loading = true;
    this.api.convertProjectToArtwork(this.project.id)
      .subscribe(() => {
        this.loading = false;
        this.msg.show('Project converted successfully', 'success');
	this.projectForm.patchValue({
	      converted: '1',
	    });
	this.saveInfo();
      });
  }


  saveInfo() {
    if (this.projectForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }
    this.projectForm.patchValue({
      modifiedUserId: this.auth.getCurrentUser().userId,
      modifiedUserName: this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName
    });

    this.project.update(this.projectForm.value);
    this.loading = true;
    this.api.updateProject(this.project.toObject())
      .subscribe(() => {
        this.loading = false;
        this.msg.show('Project saved successfully', 'success');
      });

    this.edit = false;
  }

  create() {
    if (this.projectForm.invalid) {
      this.msg.show('Please complete the form first', 'error');
      return;
    }

    this.projectForm.patchValue({
      createdById: this.auth.getCurrentUser().userId,
      createdByName: this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName,
      modifiedUserId: this.auth.getCurrentUser().userId,
      modifiedUserName: this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName
    });
    this.project.update(this.projectForm.value);
    this.loading = true;
    this.api.createProject(this.project.toObject())
      .subscribe((res: any) => {
        if (res.status) {
          this.loading = false;
          this.msg.show('Project saved successfully', 'success');
          this.router.navigate(['/projects', res.extra.id]);
        }
      });
  }

  private autoCompleteWith(field, func): Observable<any[]> {
    return this.projectForm.get(field).valueChanges.pipe(
      map(val => displayName(val).trim().toLowerCase()),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(func)
    )
  }

  selectAssignee(ev) {
    const assignee = ev.option.value;
    this.projectForm.patchValue({
      assignedUserId: assignee.id,
      assignedUserName: assignee.name
    });
  }
  
  selectAccountManager(ev) {
    const assignee = ev.option.value;
    this.projectForm.patchValue({
      accountManagerId: assignee.id,
      accountManagerName: assignee.name
    });
  }

  selectAccount(ev) {
    const account = ev.option.value;
    this.projectForm.patchValue({
      accountId: account.id,
      accountName: account.name
    });
    if(this.action =='new'){
        this.projectForm.patchValue({
          assignedUserId: account.assignedUserId,
          assignedUserName: account.assignedUserName
        });
    }
  }

}
