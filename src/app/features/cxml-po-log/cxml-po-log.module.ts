import { NgModule } from '@angular/core';
import { FuseSharedModule } from '@fuse/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';


import { CxmlPoLogComponent } from './cxml-po-log.component';
import { CxmlPoLogListComponent } from './cxml-po-log-list/cxml-po-log-list.component';
import { CxmlPoLogFormComponent } from './cxml-po-log-form/cxml-po-log-form.component';
import * as fromCxmlPoLog from './store/cxml-po-log.reducer';
import { CxmlPoLogEffects } from './store/cxml-po-log.effects';

@NgModule({
  declarations: [CxmlPoLogComponent, CxmlPoLogListComponent, CxmlPoLogFormComponent],
  imports: [
    FuseSharedModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    CdkTableModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    StoreModule.forFeature('cxmlPoLog', fromCxmlPoLog.reducer),
    EffectsModule.forFeature([CxmlPoLogEffects]),
    // StoreModule.forRoot({cxmlPoLog: fromCxmlPoLog.reducer}, { runtimeChecks: { strictStateImmutability: true, strictActionImmutability: true }}),
    // EffectsModule.forRoot([CxmlPoLogEffects]),
    CommonModule
  ],
  exports: [
    CxmlPoLogComponent
  ]
})
export class CxmlPoLogModule { }
