import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { FuseConfirmDialogModule, FuseMaterialColorPickerModule } from '@fuse/components';
import { SharedModule } from '../../shared/shared.module';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { ProjectsService } from 'app/core/services/projects.service';
import { FuseProjectsComponent } from './projects/projects.component';
import { FuseProjectsListComponent } from './projects-list/projects-list.component';
import { FuseProjectFormComponent } from './project-form/project-form.component';
import { ProjectResolverService } from './project-resolver.service';
import { FuseProjectsListModule } from './projects-list/projects-list.module';
import { ProjectsDetailsModule } from './project-details/project-details.module';
import { ProjectDetailsComponent } from './project-details/project-details.component';


const routes: Routes = [
    {
        path: '',
        component: FuseProjectsComponent,
        data: {
            helpModule: 'Project',
        },
        pathMatch: 'full',
        resolve: {
            data: ProjectsService
        }
    },
    {
        path: ':id',
        component: ProjectDetailsComponent,
        data: {
            helpModule: 'Project',
            shouldReuseRoute: false,
        },
        resolve: {
            data: ProjectResolverService
        }
    },
];

@NgModule({
    declarations   : [
        FuseProjectsComponent,
        FuseProjectFormComponent,
    ],
    imports        : [
        RouterModule.forChild(routes),
        ProjectsDetailsModule,
        CdkTableModule,

        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatChipsModule,
        MatCheckboxModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTabsModule,
        MatTableModule,
        MatToolbarModule,
        MatTooltipModule,
        MatProgressBarModule,
        FuseSharedModule,
        FuseConfirmDialogModule,
        FuseMaterialColorPickerModule,
        FuseProjectsListModule,
        NgxDnDModule,
        SharedModule
    ],
    providers      : [
        ProjectsService,
        ProjectResolverService
    ],
    entryComponents: [
        FuseProjectFormComponent
    ]
})
export class FuseProjectsModule
{
}
