import { Component, OnDestroy, OnInit, ViewEncapsulation, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription ,  Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { WorkflowControlService } from '../workflow-control.service';
import { FuseWorkflowFormComponent } from '../workflow-form/workflow-form.component';
import { WorkflowStatusComponent } from '../workflow-status/workflow-status.component';
import { SavedSearchService } from 'app/core/services/saved-search.service';



import { AuthService } from 'app/core/services/auth.service';
import { ApiService } from 'app/core/services/api.service';

@Component({
    selector     : 'fuse-workflow',
    templateUrl  : './workflow.component.html',
    styleUrls    : ['./workflow.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class FuseWorkflowComponent implements OnInit, OnDestroy
{
    @ViewChild(WorkflowStatusComponent) listComponent: WorkflowStatusComponent;

    selectedCount: number;
    searchInput: FormControl;
    onSelectionSubscription: Subscription;
    //receive output from workflow-status.component
    searchParams: any;
    showMyItems = false;

    //emit value to saved-search.component as observable
    public paramsSubject: Subject<void> = new Subject<void>();

    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
    dialogRef: MatDialogRef<FuseWorkflowFormComponent>;

    constructor(
        public wcs: WorkflowControlService,
        public dialog: MatDialog,
        private savedSearch: SavedSearchService,
        private auth: AuthService,
        private api: ApiService
    )
    {
        this.searchInput = new FormControl('');
    }

    ngOnInit()
    {
    }

    ngOnDestroy()
    {
        //this.onSelectionSubscription.unsubscribe();
    }

    clearSearch()
    {
      if (this.searchInput.value.length > 0)
        this.searchInput.setValue('');
    }

    clearFilters() {
        this.listComponent.clearFilters();
    }

    // receive params from workflow-status.component output when a search is input
    receiveParams($event) {
        this.searchParams = $event;
        this.sendParamsToSavedSearch();
    }

    receiveSavedSearchParams($event) {
        console.log($event);
    }

    // send params to saved search
    sendParamsToSavedSearch() {
        this.paramsSubject.next(this.searchParams);
    }

    merge() {
        this.listComponent.mergeOrders();
    }
    mergeBeta() {
        this.listComponent.mergeOrdersBeta();
    }

    saveFilter(searchName) {
        const data = {
            ...this.listComponent.params,
            form: this.listComponent.filterForm.value
        }
        this.savedSearch.saveSearch('workflow', searchName, data);
        
        const user = this.auth.getCurrentUser();
        this.api.saveSearch({
            module: 'workflow',
            userId: user.userId,
            setting: searchName,
            value: data
        }).subscribe(() => {});
    }

    loadFilter(filter) {
        const newObj = { ...filter };
        this.listComponent.filterForm.setValue(newObj.form);
        delete newObj.form;
        this.listComponent.params = newObj;
        this.listComponent.fetchList();
    }

    changeShowMyItems(ev) {
        this.listComponent.showMyItems = ev;
        this.listComponent.fetchList();
    }
}
