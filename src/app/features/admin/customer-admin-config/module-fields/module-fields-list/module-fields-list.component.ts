import { Component, OnInit, Input, ViewEncapsulation, ViewChild, Inject } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModuleFieldsService } from '../module-fields.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { AuthService } from 'app/core/services/auth.service';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-module-fields-list',
  templateUrl: './module-fields-list.component.html',
  styleUrls: ['./module-fields-list.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ModuleFieldsListComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  filterForm: FormGroup;
  dataSource: FieldsDataSource;
  module = 'Orders';
  displayColumns = ['fieldName', 'defaultLabelName', 'labelName', 'isVisible', 'required', 'dateModified', 'modifiedByName'];
  

  loading = false;
  loaded = () => {
      this.loading = false;
  };

  constructor(
    private moduleFieldsService: ModuleFieldsService,
    private fb: FormBuilder,
    private auth: AuthService,
    public dialog: MatDialog,
  ) 
  { 
    this.filterForm = this.fb.group(this.moduleFieldsService.params.term);
  }

  ngOnInit() {
    this.dataSource = new FieldsDataSource(this.moduleFieldsService);
    this.filterFields();
  }

  paginate(pe) {
    this.loading = true;
    this.moduleFieldsService.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  sort(se) {
    this.loading = true;
    this.moduleFieldsService.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  filterFields() {
    this.loading = true;
    if (this.module == 'Documents' || this.module == 'Portal') {
      this.displayColumns = ['defaultLabelName', 'labelName', 'moduleSection', 'dateModified', 'modifiedByName'];
    } else {
      this.displayColumns = ['fieldName', 'defaultLabelName', 'labelName', 'isVisible', 'required', 'dateModified', 'modifiedByName'];
    }
    console.log('this.displayColumns');
    console.log(this.displayColumns);
    this.moduleFieldsService.filter(this.filterForm.value)
    .subscribe(this.loaded, this.loaded);
    if(this.paginator) {
      this.paginator.firstPage();
    }
    
  }

  updateRequired(field, ev) {
    ev.stopPropagation();
    field.required = !field.required;
    if(field.required){
        field.isVisible = field.required;
    }
    this.updateField(field);
  }

  updateVisible(field, ev) {
    ev.stopPropagation();
    field.isVisible = !field.isVisible;
    if(!field.isVisible){
        field.required = field.isVisible;
    }
    this.updateField(field);
  }

  updateEnable(field, ev) {
    ev.stopPropagation();
    field.allowImport = !field.allowImport;
    this.updateField(field);
  }

  editLabel(field, ev) {
    ev.stopPropagation();
    let dialogRef = this.dialog.open(LabelEditDialogComponent, {
      width: '320px',
      data: { labelName: field.labelName }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (!result)
      {
        return;
      }
      else 
      {
        field.labelName = result;
        this.updateField(field);
      }
    });
  }

  updateField(field) {

    field.modifiedById = this.auth.getCurrentUser().userId;
    field.modifiedByName = this.auth.getCurrentUser().firstName + ' ' + this.auth.getCurrentUser().lastName;
    field.dateModified = new Date();

    //this.loading = true;
    // this.moduleFieldsService.updateModuleField(field)
    //   .subscribe(this.loaded, this.loaded);
    this.moduleFieldsService.updateModuleField(field)
    .subscribe();
  }
}

export class FieldsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private moduleFieldsService: ModuleFieldsService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.moduleFieldsService.onModuleFieldsCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.moduleFieldsService.onModuleFieldsChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}

@Component({
  selector: 'dialog-overview-example-dialog',
  template: `
  <div mat-dialog-content fxLayout="column">
    <p>Want to change the label? Please type the label name you want to edit.</p>
    <mat-form-field fxFlex>
        <input matInput tabindex="1" [(ngModel)]="data.labelName">
    </mat-form-field>
  </div>
  <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="data.labelName" tabindex="2">Ok</button>
      <button mat-button (click)="onNoClick()" tabindex="-1">No Thanks</button>
  </div>
  `
})
export class LabelEditDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<LabelEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
