import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { Subscription } from 'rxjs';
import { UomService } from '../uom.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { UomDetails } from 'app/models/uom';
import { UomFormComponent } from '../uom-form/uom-form.component';
import { delay } from 'rxjs/operators';
import { find, findIndex, sum } from 'lodash';

@Component({
  selector: 'app-uom-list',
  templateUrl: './uom-list.component.html',
  styleUrls: ['./uom-list.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations  

})
export class UomListComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: UomDataSource;
  displayedColumns = ['checkbox', 'name', 'type', 'abbreviation', 'conversionRatio', 'uomGroupId', 'status'];
  filterForm: FormGroup;
  checkboxes: any = {};
  uomGroups = [];  
  loading = false;
  loaded = () => {
      this.loading = false;
  };

  dialogRef: any;

  constructor(
    private uomService: UomService,
    private fb: FormBuilder,
    public selection: SelectionService,
    private api: ApiService,
    public dialog: MatDialog,

  ) 
  {
    this.uomService.getUomGroupsListOnly()
      .subscribe((res:any) => {
        this.uomGroups = res;
      });        
    this.filterForm = this.fb.group(this.uomService.params.term);
  }

  ngOnInit() {
    this.dataSource = new UomDataSource(this.uomService);
    this.filterUom();
  }

  filterUom() {
    this.loading = true;
    this.uomService.filter(this.filterForm.value)
    .subscribe(this.loaded, this.loaded);
    if(this.paginator) {
      this.paginator.firstPage();
    }
    
  }

  paginate(pe) {
    this.loading = true;
    this.uomService.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  sort(se) {
    this.loading = true;
    this.uomService.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  updateStatus(uom, ev) {
    ev.stopPropagation();
    this.api.getUomDetail(uom.id)
        .subscribe(data => {
          const uomDetails = new UomDetails(data);
          uomDetails.status = !uomDetails.status;
          this.updateUom(uomDetails);
        });
  }

  updateUom(uom) {
    this.loading = true;
    this.uomService.updateUomDetails(uom)
        .subscribe(this.loaded, this.loaded);
  }

  editUom(id) {
    this.loading = true;
    this.api.getUomDetail(id)
        .subscribe(data => {
            this.loading = false;
            const uomDetails = new UomDetails(data);
            this.dialogRef = this.dialog.open(UomFormComponent, {
                panelClass: 'antera-details-dialog',
                data      : {
                    uomDetails: uomDetails,
                    action : 'edit',
                }
            });
    
            this.dialogRef.afterClosed()
                .subscribe((uomDetails: UomDetails) => {
                    if (!uomDetails) return;
                    this.updateUom(uomDetails);
                });
        });

  }
  getUomGroup(uomGroupId){
      const uomGroup = find(this.uomGroups, {id: uomGroupId});               
      return uomGroup && uomGroup.name || '';
  }
  onSelectedChange(dropdownId)
  {
      this.selection.toggle(dropdownId);
  }
  
  toggleAll(ev) {
      this.selection.reset(ev.checked);
  }
}

export class UomDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private uomService: UomService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.uomService.onUomCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.uomService.onUomChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
