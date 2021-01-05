import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
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
import { TagComponent } from './tag.component';
import { TagTypeFormComponent } from './tag-type-form/tag-type-form.component';
import { MdouleTagFormComponent } from './mdoule-tag-form/mdoule-tag-form.component';
import { TagModuleFormComponent } from './tag-module-form/tag-module-form.component';
import { TagStoreFormComponent } from './tag-store-form/tag-store-form.component';
import { TagListComponent } from './tag-list/tag-list.component';
// import { TagListComponent } from './tag-list/tag-list.component';
// import { TagFormComponent } from './tag-form/tag-form.component';
// import { TagTypeFormComponent } from './tag-type-form/tag-type-form.component';

const routes: Routes = [
    {
        path: '**',
        component: TagComponent,
    }
];

@NgModule({
  imports: [
    CommonModule,
        RouterModule.forChild(routes),
        CdkTableModule,

        MatButtonModule,
        MatCheckboxModule,
        MatNativeDateModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSortModule,
        MatTabsModule,
        MatTableModule,
        MatToolbarModule,
        MatListModule,
        MatChipsModule,
        MatTooltipModule,
        MatAutocompleteModule,
        FuseSharedModule,
        FuseConfirmDialogModule,
        MatSelectModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        SharedModule
  ],
  entryComponents: [
        TagComponent,
        // TagFormComponent,
        // TagTypeFormComponent
  ],
  declarations: [
    TagComponent,
    TagTypeFormComponent,
    MdouleTagFormComponent,
    TagModuleFormComponent,
    TagStoreFormComponent,
    TagListComponent,
    // TagListComponent,
  ]
})
export class TagModule { }
