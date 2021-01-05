import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';
import { SharedModule } from '../../shared/shared.module';

import { ReportService } from './report.service';

import { FuseReportComponent } from './report.component';
import { FuseReportListComponent } from './report-list/report-list.component';
import { FuseReportFilterFormComponent } from './filter-form/filter-form.component';
import { FuseReportDetailComponent } from './report/report-detail.component';
import { FuseReportDetailService } from './report/report-detail.service';
import { CreateReportDialogComponent } from './create-report-dialog/create-report-dialog.component';
import { DocumentPdfModule } from '../documents/document-pdf/document-pdf.module';

const routes: Routes = [
    {
        path: '',
        component: FuseReportComponent,
        resolve  : {
            report: ReportService
        }
    },
    {
        path     : ':report_id/:code',
        component: FuseReportDetailComponent,
    }
];

@NgModule({
    declarations   : [
        FuseReportComponent,
        FuseReportListComponent,
        FuseReportFilterFormComponent,
        FuseReportDetailComponent,
        CreateReportDialogComponent
    ],
    imports        : [
        RouterModule.forChild(routes),
        CdkTableModule,

        MatButtonModule,
        MatCheckboxModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSortModule,
        MatSelectModule,
        MatStepperModule,
        MatTabsModule,
        MatTableModule,
        MatToolbarModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule,
        DocumentPdfModule,
        FuseSharedModule,
        FuseConfirmDialogModule,
        SharedModule
    ],
    providers      : [
        ReportService, 
        FuseReportDetailService
    ],
    entryComponents: [
        FuseReportFilterFormComponent,
        CreateReportDialogComponent
    ]
})
export class FuseReportModule
{
}
