import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { Subscription } from 'rxjs';
import { DecorationTypesService } from '../decoration-types.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { DecorationTypeDetails } from 'app/models/decoration-type';
import { DecorationTypeFormComponent } from '../decoration-type-form/decoration-type-form.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-decoration-type-list',
  templateUrl: './decoration-type-list.component.html',
  styleUrls: ['./decoration-type-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class DecorationTypeListComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource: DecorationTypesDataSource;
  displayedColumns = ['checkbox', 'name', 'detailName','active', 'createdByName', 'modifiedByName','dateModified','dateEntered'];
  filterForm: FormGroup;
  checkboxes: any = {};

  loading = false;
  loaded = () => {
      this.loading = false;
  };

  dialogRef: any;

  constructor(
    private decoTypesService: DecorationTypesService,
    private fb: FormBuilder,
    public selection: SelectionService,
    private api: ApiService,
    public dialog: MatDialog,

  ) 
  {
    this.filterForm = this.fb.group(this.decoTypesService.params.term);
  }

  ngOnInit() {
    this.dataSource = new DecorationTypesDataSource(this.decoTypesService);
    this.filterDecoTypes();
  }

  filterDecoTypes() {
    this.loading = true;
    this.decoTypesService.filter(this.filterForm.value)
    .subscribe(this.loaded, this.loaded);
    if(this.paginator) {
      this.paginator.firstPage();
    }  
  }

  paginate(pe) {
    this.loading = true;
    this.decoTypesService.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  sort(se) {
    this.loading = true;
    this.decoTypesService.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  updateActive(decoType, ev) {
    ev.stopPropagation();
    this.api.getDecorationTypeDetail(decoType.id)
        .subscribe(data => {
          const decoTypeDetails = new DecorationTypeDetails(data);
          if (decoTypeDetails.detailOptions.length ==0){
            decoTypeDetails.detailOptions.push('');
          }
          if (decoTypeDetails.detailName == ''){
            decoTypeDetails.detailName = decoTypeDetails.name;
          } 
          decoTypeDetails.active = !decoTypeDetails.active;
          this.updateDecoType(decoTypeDetails);
        });
  }

  updateDecoType(decoType) {
    this.loading = true;
    this.decoTypesService.updateDecorationTypeDetails(decoType)
        .subscribe(this.loaded, this.loaded);
  }

  editDecoType(id) {
    this.loading = true;
    this.api.getDecorationTypeDetail(id)
        .subscribe(data => {
            this.loading = false;
            const decoTypeDetails = new DecorationTypeDetails(data);
            this.dialogRef = this.dialog.open(DecorationTypeFormComponent, {
                panelClass: 'antera-details-dialog',
                data      : {
                    decoTypeDetails: decoTypeDetails,
                    action : 'edit',
                }
            });
    
            this.dialogRef.afterClosed()
                .subscribe((decoTypeDetails: DecorationTypeDetails) => {
                    if (!decoTypeDetails) return;
                    this.updateDecoType(decoTypeDetails);
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

export class DecorationTypesDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private decoTypesService: DecorationTypesService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.decoTypesService.onDecorationTypesCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.decoTypesService.onDecorationTypesChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
