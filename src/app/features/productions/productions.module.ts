import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CdkTableModule } from '@angular/cdk/table';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
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
import { FuseWidgetModule } from '@fuse/components/widget/widget.module';
import { SharedModule } from 'app/shared/shared.module';
import { ProductionsService } from 'app/core/services/productions.service';

import { ProductionResolverService } from './production-resolver.service';
import { ProductionsDetailsModule } from './production-details/production-details.module';
import { FuseProductionsComponent } from './productions/productions.component';
import { FuseScrumboardBoardComponent } from './board/board.component';
import { FuseScrumboardBoardAddListComponent } from './board/add-list/add-list.component';
import { FuseScrumboardEditBoardNameComponent } from './board/edit-board-name/edit-board-name.component';
import { FuseScrumboardBoardListComponent } from './board/list/list.component';
import { FuseScrumboardBoardCardComponent } from './board/list/card/card.component';
import { FuseScrumboardBoardEditListNameComponent } from './board/list/edit-list-name/edit-list-name.component';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MaxCharsPipe } from './max-chars.pipe';
import { ProductionDetailsComponent } from './production-details/production-details.component';

import { FuseProductionsListModule } from './productions-list/productions-list.module';
import { ProcessDialogComponent } from './productions/process-dialog/process-dialog.component';
import { MachineGraphComponent } from './productions/machine-graph/machine-graph.component';
import { PauseDialogComponent } from './productions/pause-dialog/pause-dialog.component';
import { ScheduleComponent } from './schedule/schedule.component';
import { MachineCardComponent } from './schedule/machine-card/machine-card.component';
import { BatchComponent } from './batch/batch.component';
import { BatchJobCardComponent } from './batch/batch-job-card/batch-job-card.component';
import { RemoveColumnWarningComponent } from './board/list/remove-column-warning/remove-column-warning.component';
import { BarcodeStatusDialogComponent } from './productions/barcode-status-dialog/barcode-status-dialog.component';


const routes: Routes = [
    {
        path: '',
        component: FuseProductionsComponent,
        pathMatch: 'full',
        resolve: {
            data: ProductionsService
        }
    },
    {
        path: ':id',
        component: ProductionDetailsComponent,
        resolve: {
            data: ProductionResolverService
        }
    },
];

@NgModule({
  declarations: [
    FuseProductionsComponent,
    FuseScrumboardBoardComponent,
    FuseScrumboardBoardAddListComponent,
    FuseScrumboardEditBoardNameComponent,
    FuseScrumboardBoardListComponent,
    FuseScrumboardBoardCardComponent,
    FuseScrumboardBoardEditListNameComponent,
    MaxCharsPipe,
    ProcessDialogComponent,
    MachineGraphComponent,
    PauseDialogComponent,
    ScheduleComponent,
    MachineCardComponent,
    BatchComponent,
    BatchJobCardComponent,
    RemoveColumnWarningComponent,
    BarcodeStatusDialogComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    ProductionsDetailsModule,
    FuseProductionsListModule,
    CdkTableModule,
    DragDropModule,

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
    FuseMaterialColorPickerModule,

    NgxDnDModule,
    NgxChartsModule,

    FuseSharedModule,
    FuseConfirmDialogModule,
    FuseWidgetModule,
    SharedModule,
  ],
  providers: [ProductionResolverService],
  entryComponents: [
    ProcessDialogComponent,
    PauseDialogComponent,
    RemoveColumnWarningComponent,
    BarcodeStatusDialogComponent
  ],
})
export class FuseProductionsModule {}
