import { Component, OnInit, OnDestroy, ViewEncapsulation, ViewChild } from '@angular/core';
import { Subscription ,  Observable } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';

import { IntegrationService } from 'app/core/services/integration.service';
import { PsDetailComponent } from 'app/features/settings/components/ps-detail/ps-detail.component';

import {PsCompany} from 'app/models';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'app-promostandards',
    templateUrl: './promostandards.component.html',
    styleUrls: ['./promostandards.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class PromostandardsComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['code', 'name', 'type', 'enabled'];

    dataSource: PsCompaniesDataSource | null;
    filterForm: FormGroup;
    loading: boolean = false;
        
    dialogRef: MatDialogRef<PsDetailComponent>;
        
    onTotalCountChanged: Subscription;

    payload = {
        "offset": 0,
        "limit": 50,
        "order": "name",
        "orient": "asc",
        "id": "",
        "term": {
            "code": "",
            "name": "",
            "type": "Supplier",
            "enabled": ""
        }
    };
    enabled = [
        {name:"All",value:""},
        {name:"Enabled",value:"1"},
        {name:"Disabled",value:"0"},
    ];
    constructor
    (
        private integrationService: IntegrationService,
        private fb: FormBuilder,
        public dialog: MatDialog
    ) 
    {
        this.filterForm = this.fb.group(this.payload.term);

        this.onTotalCountChanged =
            this.integrationService.onCompanyListCountChanged
                .subscribe(total => {
                    this.loading = false;
            });
        this.loadData();
    }

    ngOnInit() {
        this.dataSource = new PsCompaniesDataSource(
            this.integrationService
        );
    }

    loadData() {
        this.loading = true;
        this.payload.term = this.filterForm.value;
        this.integrationService.getPsCompanyList({...this.payload});
    }

    sortChange(ev) {
        this.payload.order = ev.active;
        this.payload.orient = ev.direction;
        if(ev.direction == "") {
            this.payload.order = "name";
            this.payload.orient = "asc";
        }
        this.loadData();
    }

    paginate(ev) {
        this.payload.offset = ev.pageIndex;
        this.payload.limit = ev.pageSize;
        this.loadData();
    }

    showCompanyDetail(company) {
        this.dialogRef = this.dialog.open(PsDetailComponent, {
            panelClass: 'ps-detail',
            data: company 
        });
        this.dialogRef.afterClosed()
            .subscribe((response) => {
                this.loadData();
            });
    }

    ngOnDestroy() {
        this.onTotalCountChanged.unsubscribe();
    }

}

export class PsCompaniesDataSource extends DataSource<any>
{
    total = 0;

    onTotalCountChanged: Subscription;

    constructor(
        private integrationService: IntegrationService
    ) {
        super();
    }

    /** Connect function called by the table to retrieve one stream containing the data to render. */
    connect(): Observable<PsCompany[]>
    {
        const displayDataChanges = [
            this.integrationService.onCompanyListChanged
        ];

        this.onTotalCountChanged =
            this.integrationService.onCompanyListCountChanged.pipe(
                delay(100)
            ).subscribe(total => {
                this.total = total;
            });

        return this.integrationService.onCompanyListChanged;
    }

    disconnect()
    {
        this.onTotalCountChanged.unsubscribe();
    }
}
