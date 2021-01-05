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
import { ArtworksService } from 'app/core/services/artworks.service';

import { ArtworkResolverService } from './artwork-resolver.service';
import { ArtworksDetailsModule } from './artwork-details/artwork-details.module';
import { FuseArtworksComponent } from './artworks/artworks.component';
import { FuseScrumboardBoardComponent } from './board/board.component';
import { FuseScrumboardBoardAddListComponent } from './board/add-list/add-list.component';
import { FuseScrumboardEditBoardNameComponent } from './board/edit-board-name/edit-board-name.component';
import { FuseScrumboardBoardListComponent } from './board/list/list.component';
import { FuseScrumboardBoardCardComponent } from './board/list/card/card.component';
import { FuseScrumboardBoardEditListNameComponent } from './board/list/edit-list-name/edit-list-name.component';
import { NgxDnDModule } from '@swimlane/ngx-dnd';
import { MaxCharsPipe } from './max-chars.pipe';
import { ArtworkDetailsComponent } from './artwork-details/artwork-details.component';

import { FuseArtworksListModule } from './artworks-list/artworks-list.module';
import { ArtistDialogComponent } from './board/list/artist-dialog/artist-dialog.component';


const routes: Routes = [
    {
        path: '',
        component: FuseArtworksComponent,
        data: {
            helpModule: 'Artwork',
        },
        pathMatch: 'full',
        resolve: {
            data: ArtworksService
        }
    },
    {
        path: ':id',
        component: ArtworkDetailsComponent,
        data: {
            helpModule: 'Artwork',
            shouldReuseRoute: false,
        },
        resolve: {
            data: ArtworkResolverService
        }
    },
];

@NgModule({
    declarations   : [
        FuseArtworksComponent,
        FuseScrumboardBoardComponent,
        FuseScrumboardBoardAddListComponent,
        FuseScrumboardEditBoardNameComponent,
        FuseScrumboardBoardListComponent,
        FuseScrumboardBoardCardComponent,
        FuseScrumboardBoardEditListNameComponent,
        MaxCharsPipe,
        ArtistDialogComponent,
    ],
    imports        : [
        RouterModule.forChild(routes),
        ArtworksDetailsModule,
        FuseArtworksListModule,
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

        FuseSharedModule,
        FuseConfirmDialogModule,
        SharedModule
    ],
    providers      : [
        ArtworkResolverService,
    ],
    entryComponents: [
        ArtistDialogComponent
    ]

})
export class FuseArtworksModule
{
}
