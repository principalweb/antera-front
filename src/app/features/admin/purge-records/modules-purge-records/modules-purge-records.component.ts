import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataSource } from '@angular/cdk/table';
import { Subscription } from 'rxjs';
import { SelectionService } from 'app/core/services/selection.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { ApiService } from 'app/core/services/api.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MessageService } from 'app/core/services/message.service';


@Component({
  selector: 'app-modules-purge-records',
  templateUrl: './modules-purge-records.component.html',
  styleUrls: ['./modules-purge-records.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations   : fuseAnimations
})
export class ModulesPurgeRecordsComponent implements OnInit {

    onSelectionChangedSubscription: Subscription;
    filterForm: FormGroup;
    dataSource: MatTableDataSource<any>;
    checkboxes: any = {};
    confirmKey: string;  
    displayedColumns = ['checkbox','position', 'name'];
    confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;

    loading = false;
    loaded = () => {
        this.loading = false;
    };

  constructor(
        public selection: SelectionService,
        private api: ApiService,
        private fb: FormBuilder,
        public dialog: MatDialog,
        private msg: MessageService
  ) { }

  ngOnInit() {
      this.dataSource = new MatTableDataSource([]);
      const tableData = [];
      this.confirmKey = "";
        const data = new FormData();
        this.loading = true;
        this.api.getModuleListToPurge(data)
        .subscribe((res: any) => {
            res.modules.forEach((row: any, i) => {
              const newRow = {
                    id:row,
                    position: i+1,
                    name: row,
              }
              tableData.push(newRow);
              
            });
                this.dataSource.data = tableData;
                this.selection.init(tableData);
                this.loading = false;
            }, (err => {
                this.loading = false;
            }));

        this.onSelectionChangedSubscription =
            this.selection.onSelectionChanged
                .subscribe(selection => {
                    this.checkboxes = selection;
                });
  }

    ngOnDestroy()
    {
        
    }

    onSelectedChange(moduleName)
    {
        this.selection.toggle(moduleName);
    }
    
    toggleAll(ev) {
        this.selection.reset(ev.checked);
    }
    
    initPurge()
    {        
        if(this.selection.selectedCount > 0){
            const data = new FormData();

            this.loading = true;
            this.api.initPurgeRecords(this.selection.selectedIds)
            .subscribe((res: any) => {
                this.confirmKey = res.confirmKey;
                this.loading = false;
                this.processPurge();
                }, (err => {
                this.loading = false;
                }));
        }else{
            alert('Please select module to purge records');
        }
    }

  processPurge() {
    this.confirmDialogRef = this.dialog.open(FuseConfirmDialogComponent, {
      disableClose: false
    });

    this.confirmDialogRef.componentInstance.confirmMessage = 'Are you sure you want to purge records for all selected modules?';

    this.confirmDialogRef.afterClosed().subscribe(result => {
        if ( result )
        {
            this.loading = true;
            this.api.processPurgeRecords(this.selection.selectedIds, this.confirmKey)
                .subscribe(() => {
                    this.msg.show('Records for selected modules deleted successfully', 'success');
                    this.loading = false;
                    this.confirmKey = "";
                    this.selection.reset(false);
                }, err => {
                    this.msg.show('Error occurred while deleting records for selected modules', 'error');
                    this.loading = false;
                    this.confirmKey = "";
                    this.selection.reset(false);
                });
        }
        this.confirmDialogRef = null;
    });
  }


}

