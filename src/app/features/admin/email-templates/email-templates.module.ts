import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
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
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FuseSharedModule } from '@fuse/shared.module';
import { SharedModule } from 'app/shared/shared.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EmailTemplatesComponent } from './email-templates.component';
import { EmailTemplatesListComponent } from './email-templates-list/email-templates-list.component';
import { EmailTemplateFormComponent } from './email-templates-form/email-template-form.component';
import { CdkTableModule } from '@angular/cdk/table';
import { EmailTemplatesService } from './email-templates.service';
import { EmailTemplateFormResolverService } from './email-templates-form/email-template-form-resolver.service';

const routes: Routes = [
  {
      path     : '',
      component: EmailTemplatesComponent,
      data: {
          helpModule: 'Email Templates'
      },
      resolve     : {
        templates : EmailTemplatesService
      }
  },
  {
    path: ':id',
    component: EmailTemplateFormComponent,
    data: {
        helpModule: 'Email Templates'
    },
    resolve: {
      template: EmailTemplateFormResolverService
    }
  }
];

@NgModule({
  declarations: [
    EmailTemplatesComponent,
    EmailTemplatesListComponent,
    EmailTemplateFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatTabsModule,
    MatDialogModule,
    MatListModule,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCardModule,
    MatTableModule,
    CdkTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    CKEditorModule,
    
    FuseSharedModule,
    SharedModule
  ],
  providers: [
    EmailTemplatesService,
    EmailTemplateFormResolverService,
  ],
  entryComponents: [EmailTemplateFormComponent]
})
export class EmailTemplatesModule { }
