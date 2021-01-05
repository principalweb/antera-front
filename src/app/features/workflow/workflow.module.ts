import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
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
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule } from '@fuse/components';
import { SharedModule } from '../../shared/shared.module';

import { WorkflowService } from './workflow.service';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { FuseWorkflowComponent } from './workflow/workflow.component';
import { FuseWorkflowListComponent } from './workflow-list/workflow-list.component';
import { FuseWorkflowFormComponent } from './workflow-form/workflow-form.component';
import { WorkflowStatusComponent } from './workflow-status/workflow-status.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { WorkflowProcessPopoverComponent } from './workflow-process-popover/workflow-process-popover.component';
import { WorkflowControlService } from './workflow-control.service';
import { WorkflowFilterComponent } from './workflow-filter/workflow-filter.component';
// mail stuff
import { MailService } from '../../main/content/apps/mail/mail.service';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ActionService } from '../../core/services/action.service';
import { AccountsService } from 'app/features/accounts/accounts.service';
import { TooltipModule } from 'ng2-tooltip-directive';

const routes: Routes = [
    {
        path: '**',
        component: FuseWorkflowComponent,
        data: {
            helpModule: 'CRM',
        },
        resolve  : {
            workflow: WorkflowService
        }
    }
];

@NgModule({
    declarations   : [
        FuseWorkflowComponent,
        FuseWorkflowListComponent,
        FuseWorkflowFormComponent,
        WorkflowStatusComponent,
        WorkflowProcessPopoverComponent,
        WorkflowFilterComponent,
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
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatProgressSpinnerModule,
        MatSortModule,
        MatTabsModule,
        MatTableModule,
        MatToolbarModule,
        MatTooltipModule,
        TooltipModule,
        FuseSharedModule,
        FuseConfirmDialogModule,
        SharedModule,

        NgxDatatableModule,
    ],
    providers      : [
        WorkflowService,
        WorkflowControlService,
        MailService,
        AuthService,
        ApiService,
        ActionService,
        AwsFileManagerService,
        AccountsService
    ],
    entryComponents: [
        FuseWorkflowFormComponent
    ]
})
export class FuseWorkflowModule
{
}
