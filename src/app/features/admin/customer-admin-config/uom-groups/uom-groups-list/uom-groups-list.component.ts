import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { Subscription } from 'rxjs';
import { UomGroupsService } from '../uom-groups.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { UomGroupsDetails } from 'app/models/uom-groups';
import { UomGroupsFormComponent } from '../uom-groups-form/uom-groups-form.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-uom-groups-list',
  templateUrl: './uom-groups-list.component.html',
  styleUrls: ['./uom-groups-list.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations  
})
export class UomGroupsListComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: UomGroupsDataSource;
  displayedColumns = ['checkbox', 'name', 'type', 'status'];
  filterForm: FormGroup;
  checkboxes: any = {};

  loading = false;
  loaded = () => {
      this.loading = false;
  };

  dialogRef: any;

  constructor(
    private uomGroupsService: UomGroupsService,
    private fb: FormBuilder,
    public selection: SelectionService,
    private api: ApiService,
    public dialog: MatDialog,

  ) 
  {
    this.filterForm = this.fb.group(this.uomGroupsService.params.term);
  }

  ngOnInit() {
    this.dataSource = new UomGroupsDataSource(this.uomGroupsService);
    this.filterUomGroups();
  }

  filterUomGroups() {
    this.loading = true;
    this.uomGroupsService.filter(this.filterForm.value)
    .subscribe(this.loaded, this.loaded);
    if(this.paginator) {
      this.paginator.firstPage();
    }  
  }

  paginate(pe) {
    this.loading = true;
    this.uomGroupsService.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  sort(se) {
    this.loading = true;
    this.uomGroupsService.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  updateStatus(uomGroups, ev) {
    ev.stopPropagation();
    this.api.getUomGroupsDetail(uomGroups.id)
        .subscribe(data => {
          const uomGroupsDetails = new UomGroupsDetails(data);
          uomGroupsDetails.status = !uomGroupsDetails.status;
          this.updateUomGroups(uomGroupsDetails);
        });
  }

  updateUomGroups(uomGroups) {
    this.loading = true;
    this.uomGroupsService.updateUomGroupsDetails(uomGroups)
        .subscribe(this.loaded, this.loaded);
  }

  editUomGroups(id) {
    this.loading = true;
    this.api.getUomGroupsDetail(id)
        .subscribe(data => {
            this.loading = false;
            const uomGroupsDetails = new UomGroupsDetails(data);
            this.dialogRef = this.dialog.open(UomGroupsFormComponent, {
                panelClass: 'antera-details-dialog',
                data      : {
                    uomGroupsDetails: uomGroupsDetails,
                    action : 'edit',
                }
            });
    
            this.dialogRef.afterClosed()
                .subscribe((uomGroupsDetails: UomGroupsDetails) => {
                    if (!uomGroupsDetails) return;
                    this.updateUomGroups(uomGroupsDetails);
                });
        });
  }

  onSelectedChange(dropdownId)
  {
      this.selection.toggle(dropdownId);
  }
  
  toggleAll(ev) {
      this.selection.reset(ev.checked);
  }
}

export class UomGroupsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private uomGroupsService: UomGroupsService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.uomGroupsService.onUomGroupsCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.uomGroupsService.onUomGroupsChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
