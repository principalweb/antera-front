import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { ModuleFieldsService } from './module-fields.service';
import { ModuleFieldsListComponent } from './module-fields-list/module-fields-list.component';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-module-fields',
  templateUrl: './module-fields.component.html',
  styleUrls: ['./module-fields.component.scss'],
})
export class ModuleFieldsComponent implements OnInit {

  @ViewChild(ModuleFieldsListComponent) moduleFieldsListComponent: ModuleFieldsListComponent;

  constructor(
    private moduleFieldsService: ModuleFieldsService,
    private fb: FormBuilder,
  ) 
  {

  }

  ngOnInit() {
  }

  switchModule(ev) {
    this.moduleFieldsListComponent.module = ev.value;
    this.moduleFieldsService.params.term = {
      module: ev.value,
      moduleSection: '',
      fieldName: '',
      defaultLabelName: '',
      labelName: '',
      isVisible: '',
      required: '',
      dateModified: '',
      modifiedByName: ''
    }
    if(ev.value =='Documents' || ev.value =='Portal'){
        this.moduleFieldsService.params.order = "moduleSection";
    }else{
        this.moduleFieldsService.params.order = "fieldName";
    }
    this.moduleFieldsListComponent.filterForm.reset();
    this.moduleFieldsListComponent.filterForm.setValue(this.moduleFieldsService.params.term);
    this.moduleFieldsListComponent.filterFields();
  }

  clearFilters() {
    this.moduleFieldsService.params.term = {
      module: this.moduleFieldsService.params.term.module,
      moduleSection: '',
      fieldName: '',
      defaultLabelName: '',
      labelName: '',
      isVisible: '',
      required: '',
      dateModified: '',
      modifiedByName: ''
    }
    this.moduleFieldsListComponent.filterForm.reset();
    this.moduleFieldsListComponent.filterForm.setValue(this.moduleFieldsService.params.term);
    this.moduleFieldsListComponent.filterFields();
  }
}
