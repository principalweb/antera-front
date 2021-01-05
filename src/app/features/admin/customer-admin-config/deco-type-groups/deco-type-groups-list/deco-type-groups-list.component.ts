import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { Subscription } from 'rxjs';
import { DecoTypeGroupsService } from '../deco-type-groups.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { DecoTypeGroupsDetails } from 'app/models/deco-type-groups';
import { DecoTypeGroupsFormComponent } from '../deco-type-groups-form/deco-type-groups-form.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-deco-type-groups-list',
  templateUrl: './deco-type-groups-list.component.html',
  styleUrls: ['./deco-type-groups-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations  
})
export class DecoTypeGroupsListComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: DecoTypeGroupsDataSource;
  displayedColumns = ['checkbox', 'name', 'status', 'createdByName', 'modifiedByName','dateModified','dateEntered'];
  filterForm: FormGroup;
  checkboxes: any = {};

  loading = false;
  loaded = () => {
      this.loading = false;
  };

  dialogRef: any;

  constructor(
    private decoTypeGroupsService: DecoTypeGroupsService,
    private fb: FormBuilder,
    public selection: SelectionService,
    private api: ApiService,
    public dialog: MatDialog,

  ) 
  {
    this.filterForm = this.fb.group(this.decoTypeGroupsService.params.term);
  }

  ngOnInit() {
    this.dataSource = new DecoTypeGroupsDataSource(this.decoTypeGroupsService);
    this.filterDecoTypeGroups();
  }

  filterDecoTypeGroups() {
    this.loading = true;
    this.decoTypeGroupsService.filter(this.filterForm.value)
    .subscribe(this.loaded, this.loaded);
    if(this.paginator) {
      this.paginator.firstPage();
    }
  }

  paginate(pe) {
    this.loading = true;
    this.decoTypeGroupsService.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  sort(se) {
    this.loading = true;
    this.decoTypeGroupsService.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  updateStatus(decoTypeGroups, ev) {
    ev.stopPropagation();
    this.api.getDecoTypeGroupsDetail(decoTypeGroups.id)
        .subscribe(data => {
          const decoTypeGroupsDetails = new DecoTypeGroupsDetails(data);
          console.log(decoTypeGroupsDetails);
          decoTypeGroupsDetails.status = !decoTypeGroupsDetails.status;
          console.log(decoTypeGroupsDetails);
          this.updateDecoTypeGroups(decoTypeGroupsDetails);
        });
  }

  updateDecoTypeGroups(decoTypeGroups) {
    this.loading = true;
    this.decoTypeGroupsService.updateDecoTypeGroupsDetails(decoTypeGroups)
        .subscribe(this.loaded, this.loaded);
  }

  editDecoTypeGroups(id) {
    this.loading = true;
    this.api.getDecoTypeGroupsDetail(id)
        .subscribe(data => {
            this.loading = false;
            const decoTypeGroupsDetails = new DecoTypeGroupsDetails(data);
            this.dialogRef = this.dialog.open(DecoTypeGroupsFormComponent, {
                panelClass: 'antera-details-dialog',
                data      : {
                    decoTypeGroupsDetails: decoTypeGroupsDetails,
                    action : 'edit',
                }
            });
    
            this.dialogRef.afterClosed()
                .subscribe((decoTypeGroupsDetails: DecoTypeGroupsDetails) => {
                    if (!decoTypeGroupsDetails) return;
                    this.updateDecoTypeGroups(decoTypeGroupsDetails);
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

export class DecoTypeGroupsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private decoTypeGroupsService: DecoTypeGroupsService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.decoTypeGroupsService.onDecoTypeGroupsCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.decoTypeGroupsService.onDecoTypeGroupsChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
