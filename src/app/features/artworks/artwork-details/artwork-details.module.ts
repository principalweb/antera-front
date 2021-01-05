import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
import { SharedModule } from 'app/shared/shared.module';

import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { ArtworkDetailsComponent } from './artwork-details.component';
import { ArtworkVariationComponent } from './artwork-variation/artwork-variation.component';
import { DetailsTabComponent } from './details-tab/details-tab.component';
import { DesignTabComponent } from './design-tab/design-tab.component';

import { DesignPreviewPopupComponent } from './design-preview-popup/design-preview-popup.component';
import { ArtworkFileUtilService } from './artwork-details-file-util.service';
import { GenericErrorComponent } from './generic-error/generic-error.component';
import { AwsFileManagerService } from 'app/core/services/aws.service';
import { UpdateArtworkVariationToOrderComponent } from './update-artwork-variation-to-order/update-artwork-variation-to-order.component';
@NgModule({
    declarations   : [
        ArtworkDetailsComponent,
        ArtworkVariationComponent,
        DetailsTabComponent,
        DesignTabComponent,
        DesignPreviewPopupComponent,
        GenericErrorComponent,
        UpdateArtworkVariationToOrderComponent,
        
    ],
    imports        : [
        CdkTableModule,
        RouterModule,
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

        FuseSharedModule,
        FuseConfirmDialogModule,
        SharedModule,
    ],
    providers      : [
        ArtworkFileUtilService,
        AwsFileManagerService,
        ArtworkDetailsComponent
    ],
    exports: [
        ArtworkDetailsComponent,
        ArtworkVariationComponent,
        UpdateArtworkVariationToOrderComponent
    ],
    entryComponents: [
        DesignPreviewPopupComponent,
    ]
})
export class ArtworksDetailsModule
{
}
