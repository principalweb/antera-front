import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription ,  forkJoin } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CommissionsService } from '../commissions.service';
import { SelectionService } from 'app/core/services/selection.service';
import { ApiService } from 'app/core/services/api.service';
import { fuseAnimations } from '@fuse/animations';
import { DataSource } from '@angular/cdk/table';
import { Commission } from 'app/models/commission';
import { MatDialog } from '@angular/material/dialog';
import { CommissionGroupsService } from '../commission-groups.service';
import { CommissionGroupFormComponent } from '../commission-group-form/commission-group-form.component';
import { delay } from 'rxjs/operators';

@Component({
  selector: 'app-commission-group-list',
  templateUrl: './commission-group-list.component.html',
  styleUrls: ['./commission-group-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class CommissionGroupListComponent implements OnInit {

  onCommissionsChanged: Subscription;
  onSelectionChangedSubscription: Subscription;

  filterForm: FormGroup;
  dataSource: CommissionGroupsDataSource;
  checkboxes: any = {};
  displayedColumns = ['checkbox', 'name', 'description', 'modifiedByName'];

  loading = false;
  loaded = () => {
      this.loading = false;
  };

  dialogRef: any;

  constructor(
    private service: CommissionGroupsService,
    public selection: SelectionService,
    private fb: FormBuilder,
    private api: ApiService,
    public dialog: MatDialog,
  ) 
  {
    this.filterForm = this.fb.group(this.service.params.term);
  }

  ngOnInit() {
    this.dataSource = new CommissionGroupsDataSource(this.service);
    
    this.onCommissionsChanged =
      this.service.onEntitiesChanged
          .subscribe(groups => {
              this.selection.init(groups);
          });

    this.onSelectionChangedSubscription =
      this.selection.onSelectionChanged
          .subscribe(selection => {
              this.checkboxes = selection;
          });
          
    this.filterCommissions();
  }

  ngOnDestroy()
  {
    this.onCommissionsChanged.unsubscribe();
  }

  onSelectedChange(dropdownId)
  {
    this.selection.toggle(dropdownId);
  }
  
  toggleAll(ev) {
    this.selection.reset(ev.checked);
  }

  filterCommissions() {
    this.loading = true;
    this.service.filter(this.filterForm.value)
        .subscribe(this.loaded, this.loaded);
  }

  clearFilters() {
    this.filterForm.reset();
    this.filterCommissions();
  }

  sort(se) {
    this.loading = true;
    this.service.filter(this.filterForm.value)
    this.service.sort(se)
        .subscribe(this.loaded, this.loaded);
  }

  paginate(pe) {
    this.loading = true;
    this.service.setPagination(pe)
        .subscribe(this.loaded, this.loaded);
  }

  edit(id) {
    this.loading = true;

    forkJoin([
      this.api.getCommissionGroupDetail(id),
      this.api.getCommissionsForGroup(id),
    ]).subscribe(([data, commissions]: any) => {
            this.loading = false;
            const commissionGroup = data;
            this.dialogRef = this.dialog.open(CommissionGroupFormComponent, {
                panelClass: 'antera-details-dialog',
                height: '80%',
                data      : {
                    commissionGroup: commissionGroup,
                    commissions: commissions,
                    action : 'edit',
                }
            });
    
            this.dialogRef.afterClosed()
                .subscribe((group: any) => {
                    if (!group) { 
                      return; 
                    }
                    this.updateCommissionGroup(group);
                });
        });
  }

  updateCommissionGroup(commissionDetail) {
    this.loading = true;
    this.service.update(commissionDetail)
        .subscribe(this.loaded, this.loaded);
  }
}

export class CommissionGroupsDataSource extends DataSource<any>
{
    total = 0;

    onCountChangedSubscription: Subscription;

    constructor(
        private service: CommissionGroupsService,
    ) {
        super();
    }

    connect()
    {
        this.onCountChangedSubscription = 
            this.service.onEntitiesCountChanged.pipe(
              delay(300),
            ).subscribe(c => {
                this.total = c;
            });

        return this.service.onEntitiesChanged;
    }

    disconnect()
    {
        this.onCountChangedSubscription.unsubscribe();
    }
}
