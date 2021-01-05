import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Subscription } from 'rxjs';
import { SelectionService } from 'app/core/services/selection.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { DropdownsService } from '../dropdowns.service';
import { Router } from '@angular/router';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-dropdown-list',
  templateUrl: './dropdown-list.component.html',
  styleUrls: ['./dropdown-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class DropdownListComponent implements OnInit {

    onDropdownsChangedSubscription: Subscription;
    onSelectionChangedSubscription: Subscription;

    filterForm: FormGroup;
    dataSource: DropdownsDataSource;
    checkboxes: any = {};
    displayedColumns = ['checkbox', 'name', 'labelName', 'description', 'modules', 'createdByName', 'modifiedByName', 'dateModified'];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    loading = false;
    loaded = () => {
        this.loading = false;
    };

    constructor(
        private dropdownService: DropdownsService,
        public selection: SelectionService,
        private fb: FormBuilder,
        public dialog: MatDialog,
        private router: Router,
    ) 
    {
        this.filterForm = this.fb.group(this.dropdownService.params.term);
    }

    ngOnInit() 
    {
        this.dataSource = new DropdownsDataSource(this.dropdownService);
        this.onDropdownsChangedSubscription =
            this.dropdownService.onDropdownsChanged
                .subscribe(dropdowns => {
                    this.selection.init(dropdowns);
                });

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged
                .subscribe(selection => {
                    this.checkboxes = selection;
                });
                
        this.dropdownService.getDropdownsAndCount()
            .subscribe((res) => {

            });
    }

    ngOnDestroy()
    {
        this.onDropdownsChangedSubscription.unsubscribe();
    }

    onSelectedChange(dropdownId)
    {
        this.selection.toggle(dropdownId);
    }
    
    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }

    filterDropdowns() {
        this.loading = true;
        this.dropdownService.filter(this.filterForm.value)
        .subscribe(this.loaded, this.loaded);
    }

    clearFilters() {
        this.filterForm.reset();
        this.filterDropdowns();
    }

    sort(se) {
        this.loading = true;
        this.dropdownService.sort(se)
            .subscribe(this.loaded, this.loaded);
    }

    paginate(pe) {
        this.loading = true;
        this.dropdownService.setPagination(pe)
            .subscribe(this.loaded, this.loaded);
    }

    editRow(dropdown) {
        const queryParams = {name: dropdown.name};
        this.router.navigate(['admin/dropdowns/options'], {queryParams});
    }
}

export class DropdownsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private dropdownsService: DropdownsService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.dropdownsService.onDropdownsCountChanged.pipe(
                delay(300)
            ).subscribe(c => {
                this.total = c;
            });

        return this.dropdownsService.onDropdownsChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
