import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { DecorationLocationsService } from '../decoration-locations.service';
import { SelectionService } from 'app/core/services/selection.service';
import { DataSource } from '@angular/cdk/table';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { DecorationLocationDetails } from 'app/models/decoration-location';
import { DecorationLocationFormComponent } from '../decoration-location-form/decoration-location-form.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-decoration-location-list',
  templateUrl: './decoration-location-list.component.html',
  styleUrls: ['./decoration-location-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class DecorationLocationListComponent implements OnInit {

  onDecorationLocationsChanged: Subscription;
  onSelectionChangedSubscription: Subscription;

  filterForm: FormGroup;
  dataSource: DecoLocationsDataSource;
  checkboxes: any = {};
  displayedColumns = ['checkbox', 'locationImage', 'locationName', 'locationHexColor', 'description', 'createdByName', 'modifiedByName', 'dateModified'];
  confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

  loading = false;
  loaded = () => {
      this.loading = false;
  };

  dialogRef: any;

  constructor(
    private decoLocationsService: DecorationLocationsService,
    public selection: SelectionService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private api: ApiService,
  ) 
  { 
    this.filterForm = this.fb.group(this.decoLocationsService.params.term);
  }

  ngOnInit() 
  {
    this.dataSource = new DecoLocationsDataSource(this.decoLocationsService);
    console.log(this.dataSource);
    this.onDecorationLocationsChanged =
      this.decoLocationsService.onDecorationLocationsChanged
          .subscribe(dropdowns => {
              this.selection.init(dropdowns);
          });

    this.onSelectionChangedSubscription =
      this.selection.onSelectionChanged
          .subscribe(selection => {
              this.checkboxes = selection;
          });
          
    this.filterDecoLocations();
  }

  ngOnDestroy()
  {
    this.onDecorationLocationsChanged.unsubscribe();
  }

  onSelectedChange(dropdownId)
  {
    this.selection.toggle(dropdownId);
  }
  
  toggleAll(ev) {
    this.selection.reset(ev.checked);
  }

  filterDecoLocations() {
    this.loading = true;
    this.decoLocationsService.filter(this.filterForm.value)
        .subscribe(this.loaded, this.loaded);
  }

  clearFilters() {
    this.filterForm.reset();
    this.filterDecoLocations();
  }

  sort(se) {
    this.loading = true;
    this.decoLocationsService.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  paginate(pe) {
    this.loading = true;
    this.decoLocationsService.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  editDecoLocation(id) {
    this.loading = true;
    this.api.getDecorationLocationDetail(id)
        .subscribe(data => {
            this.loading = false;
            const decoLocationDetails = new DecorationLocationDetails(data);
            this.dialogRef = this.dialog.open(DecorationLocationFormComponent, {
                panelClass: 'antera-details-dialog',
                data      : {
                    decoLocationDetails: decoLocationDetails,
                    action : 'edit',
                }
            });
    
            this.dialogRef.afterClosed()
                .subscribe((decoLocationDetails: DecorationLocationDetails) => {
                    if (!decoLocationDetails) return;
                    this.updateDecoLocation(decoLocationDetails);
                });
        });
  }

  updateDecoLocation(decoLocationDetails) {
    this.loading = true;
    this.decoLocationsService.updateDecorationLocation(decoLocationDetails)
        .subscribe(this.loaded, this.loaded);
  }
}

export class DecoLocationsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private decoLocationsService: DecorationLocationsService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.decoLocationsService.onDecorationLocationsCountChanged.pipe(
                delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.decoLocationsService.onDecorationLocationsChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
