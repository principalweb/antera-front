import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentsComponent } from './documents.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FuseSharedModule } from '@fuse/shared.module';
import { DocumentsMainSidenavComponent } from './sidenavs/main/main-sidenav.component';
import { TemplatesMainSidenavComponent } from './sidenavs/right-sidenav/right-sidenav.component';
import { SharedModule } from '../../../shared/shared.module';
import { DocumentsService } from '../../../core/services/documents.service';
import { FuseSidebarModule } from '@fuse/components';
import { DefaultOptionsComponent } from './sidenavs/default-options/default-options.component';
import { DocumentPdfModule } from 'app/features/documents/document-pdf/document-pdf.module';

const routes: Routes = [
  {
      path     : '',
      component: DocumentsComponent,
      data: {
        helpModule: 'Documents',
      },
      resolve : {
        invoice : DocumentsService
      }
  }
];

@NgModule({
  declarations: [
    DocumentsComponent,
    DocumentsMainSidenavComponent,
    TemplatesMainSidenavComponent,
    DefaultOptionsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatCardModule,
    MatToolbarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatInputModule,
    FuseSidebarModule,
    DocumentPdfModule,
    FuseSharedModule,
    SharedModule
  ],
  entryComponents: [
      DefaultOptionsComponent,
    ]
})
export class DocumentsModule { }
